const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const Promise = require('promise');
const request = require('request-promise');
const AWS = require('aws-sdk');
const berlioz = require('berlioz-connector');

const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, response) => {
    var renderData = {
        drugs: []
    };

    return Promise.resolve()
        .then(() => {
            var peer = berlioz.getRandomPeer('service', 'registry_app', 'client');
            if (peer) {
                var url = 'http://' + peer.address + ':' + peer.port + '/items';
                return request({ url: url, json: true, timeout: 1000 })
                    .then(result => {
                        renderData.drugs = result;
                    });
            }
        })
        // .then(() => queryFromAppClient(renderData.appPeer))
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

app.post('/new-drug', (req, response) => {
    var peer = berlioz.getRandomPeer('service', 'registry_app', 'client');
    if (!peer) {
        return response.status(503).send('Peer Unavailable.');
    }
    var url = 'http://' + peer.address + ':' + peer.port + '/item';
    return request({ url: url, body: req.body, method: 'POST', json: true, timeout: 1000 })
        .then(body => {
            return response.redirect('/');
        })
        .catch(reason => {
            response.send('ERROR FROM Web::NewDrug ' + JSON.stringify(reason));
        });
});

app.post('/drop-prescription', (req, response) => {
    var peer = berlioz.getRandomPeer('service', 'work_app', 'client');
    if (!peer) {
        return response.status(503).send('Peer Unavailable.');
    }
    var url = 'http://' + peer.address + ':' + peer.port + '/job';
    return request({ url: url, body: req.body, method: 'POST', json: true, timeout: 1000 })
        .then(body => {
            return response.redirect('/');
        })
        .catch(error => {
            response.send(error);
        });
});

app.get('/debug', (req, response) => {
    var appClientEndpoints = {};
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
        // .then(() => queryFromAppClient(renderData.appPeer))
        .catch(error => {
            if (error instanceof Error) {
                renderData.error = error.stack + error.stack;
            } else {
                renderData.error = JSON.stringify(error, null, 2);
            }
        })
        .then(() => {
            response.render('pages/debug', renderData);
        })
        ;
})






app.get('/peers', (req, response) => {
    response.send(berlioz.extractRoot());
})

// app.get('/queue/info', (req, response) => {
//     var kinesisInfo = berlioz.getQueueInfo('messages');
//     response.send(JSON.stringify(kinesisInfo));
// })
//
// app.get('/queue/insert', (req, response) => {
//     var kinesisInfo = berlioz.getQueueInfo('messages');
//     var kinesis = new AWS.Kinesis(kinesisInfo.config);
//
//     var params = {
//         StreamName: kinesisInfo.streamName,
//         PartitionKey: 'myKey',
//         Data: 'Hello from ' + process.env.BERLIOZ_TASK_ID
//     };
//     return kinesis.putRecord(params).promise()
//         .then(data => {
//             response.send(JSON.stringify(data));
//         })
//         .catch(reason => {
//             response.send(err);
//         });
// })
//
// app.get('/queue/read', (req, response) => {
//     var kinesisInfo = berlioz.getQueueInfo('messages');
//     var kinesis = new AWS.Kinesis(kinesisInfo.config);
//
//     return kinesis.describeStream({ StreamName: kinesisInfo.streamName }).promise()
//         .then(streamData => {
//             var shardId = streamData.StreamDescription.Shards[0].ShardId;
//             return kinesis.getShardIterator({ ShardId: shardId, StreamName: kinesisInfo.streamName, ShardIteratorType: 'TRIM_HORIZON' }).promise();
//         })
//         .then(shardIteratorData => {
//             return kinesis.getRecords({ ShardIterator: shardIteratorData.ShardIterator }).promise();
//         })
//         .then(data => {
//             response.send(JSON.stringify(data));
//         })
//         .catch(reason => {
//             response.send(reason);
//         });
// })
//
// app.get('/queue/describe', (req, response) => {
//     var kinesisInfo = berlioz.getQueueInfo('messages');
//     var kinesis = new AWS.Kinesis(kinesisInfo.config);
//
//     return kinesis.describeStream({ StreamName: kinesisInfo.streamName }).promise()
//         .then(data => {
//             response.send(JSON.stringify(data));
//         })
//         .catch(reason => {
//             response.send(reason);
//         });
// })
//
// function queryFromAppClient(appPeer)
// {
//     if (appClientEndpoints && _.keys(appClientEndpoints).length > 0)
//     {
//         var peerIdentities = _.keys(appClientEndpoints);
//         var peerIdentity = peerIdentities[_.random(peerIdentities.length - 1)];
//         var peer = appClientEndpoints[peerIdentity];
//         appPeer.url = 'http://' + peer.address + ':' + peer.port;
//         return request({ url: appPeer.url, json: false, timeout: 5000 })
//             .then(body => {
//                 appPeer.cardClass = 'eastern-blue';
//                 appPeer.title = 'RESPONSE';
//                 appPeer.response = JSON.stringify(body, null, 2);
//             })
//             .catch(error => {
//                 appPeer.cardClass = 'red';
//                 appPeer.title = 'ERROR';
//                 appPeer.response = JSON.stringify(error, null, 2);
//             });
//     } else {
//         appPeer.cardClass = 'yellow';
//         appPeer.title = 'No peers present';
//     }
// }

app.listen(process.env.BERLIOZ_LISTEN_PORT_CLIENT, process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_CLIENT}`)
})
