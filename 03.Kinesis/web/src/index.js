const express = require('express')
const _ = require('lodash')
const request = require('request-promise');
const AWS = require('aws-sdk');
const Promise = require('promise');
const berlioz = require('berlioz-connector');

var appClientEndpoints = null;
berlioz.monitorPeers('service', 'app', 'client', peers => {
    console.log('PEERS:');
    console.log(JSON.stringify(peers, null, 2));
    appClientEndpoints = peers;
});

const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs');

app.get('/', (req, response) => {
    var renderData = {
        settings: [
            {name: 'Task ID', value: process.env.BERLIOZ_TASK_ID },
            {name: 'Instance ID', value: process.env.BERLIOZ_INSTANCE_ID },
            {name: 'Region', value: process.env.BERLIOZ_AWS_REGION }
        ],
        peers: appClientEndpoints,
        peersStr: JSON.stringify(appClientEndpoints, null, 2),
        appPeer: {
        }
    };

    return Promise.resolve()
        .then(() => queryFromAppClient(renderData.appPeer))
        .catch(error => {
            if (error instanceof Error) {
                renderData.error = error.stack + error.stack;
            } else {
                renderData.error = JSON.stringify(error, null, 2);
            }
        })
        .then(() => {
            response.render('pages/index', renderData);
        })
        ;
})


app.get('/peers', (req, response) => {
    response.setHeader('Content-Type', 'application/json');
    response.send(JSON.stringify(berlioz.extractRoot()));
})

app.get('/queue/info', (req, response) => {
    var kinesisInfo = berlioz.getQueueInfo('messages');
    response.send(JSON.stringify(kinesisInfo));
})

app.get('/queue/insert', (req, response) => {
    var kinesisInfo = berlioz.getQueueInfo('messages');
    var kinesis = new AWS.Kinesis(kinesisInfo.config);

    var params = {
        StreamName: kinesisInfo.streamName,
        PartitionKey: 'myKey',
        Data: 'Hello from ' + process.env.BERLIOZ_TASK_ID
    };
    return kinesis.putRecord(params).promise()
        .then(data => {
            response.send(JSON.stringify(data));
        })
        .catch(reason => {
            response.send(err);
        });
})

app.get('/queue/read', (req, response) => {
    var kinesisInfo = berlioz.getQueueInfo('messages');
    var kinesis = new AWS.Kinesis(kinesisInfo.config);

    return kinesis.describeStream({ StreamName: kinesisInfo.streamName }).promise()
        .then(streamData => {
            var shardId = streamData.StreamDescription.Shards[0].ShardId;
            return kinesis.getShardIterator({ ShardId: shardId, StreamName: kinesisInfo.streamName, ShardIteratorType: 'TRIM_HORIZON' }).promise();
        })
        .then(shardIteratorData => {
            return kinesis.getRecords({ ShardIterator: shardIteratorData.ShardIterator }).promise();
        })
        .then(data => {
            response.send(JSON.stringify(data));
        })
        .catch(reason => {
            response.send(reason);
        });
})

app.get('/queue/describe', (req, response) => {
    var kinesisInfo = berlioz.getQueueInfo('messages');
    var kinesis = new AWS.Kinesis(kinesisInfo.config);

    return kinesis.describeStream({ StreamName: kinesisInfo.streamName }).promise()
        .then(data => {
            response.send(JSON.stringify(data));
        })
        .catch(reason => {
            response.send(reason);
        });
})

function queryFromAppClient(appPeer)
{
    if (appClientEndpoints && _.keys(appClientEndpoints).length > 0)
    {
        var peerIdentities = _.keys(appClientEndpoints);
        var peerIdentity = peerIdentities[_.random(peerIdentities.length - 1)];
        var peer = appClientEndpoints[peerIdentity];
        appPeer.url = 'http://' + peer.address + ':' + peer.port;
        return request({ url: appPeer.url, json: false, timeout: 5000 })
            .then(body => {
                appPeer.cardClass = 'eastern-blue';
                appPeer.title = 'RESPONSE';
                appPeer.response = JSON.stringify(body, null, 2);
            })
            .catch(error => {
                appPeer.cardClass = 'red';
                appPeer.title = 'ERROR';
                appPeer.response = JSON.stringify(error, null, 2);
            });
    } else {
        appPeer.cardClass = 'yellow';
        appPeer.title = 'No peers present';
    }
}

app.listen(process.env.BERLIOZ_LISTEN_PORT_CLIENT, process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_CLIENT}`)
})
