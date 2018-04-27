const express = require('express')
const _ = require('lodash')
const request = require('request-promise');
const Promise = require('promise');
const berlioz = require('berlioz-connector');

var currentPeers = null;
berlioz.monitorPeers('service', 'app', 'client', peers => {
    console.log('PEERS:');
    console.log(JSON.stringify(peers, null, 2));
    currentPeers = peers;
});

const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs');

app.get('/', function (req, response) {
    // currentPeers = {
    //     "22": [ {
    //         "name": "client",
    //         "port": 4000,
    //         "protocol": "http",
    //         "networkProtocol": "tcp",
    //         "hostPort": 32768,
    //         "address": "10.0.0.45",
    //         "instanceAddress": "10.0.0.45",
    //         "publicAddress": "54.161.64.164" } ],
    //     "11": [ {
    //         "name": "client",
    //         "port": 4000,
    //         "protocol": "http",
    //         "networkProtocol": "tcp",
    //         "hostPort": 32744,
    //         "address": "10.0.0.45",
    //         "instanceAddress": "10.0.0.45",
    //         "publicAddress": "54.161.64.164" } ]
    // };

    var renderData = {
        settings: [
            {name: 'Task ID', value: process.env.BERLIOZ_TASK_ID },
            {name: 'Instance ID', value: process.env.BERLIOZ_INSTANCE_ID },
            {name: 'Region', value: process.env.BERLIOZ_AWS_REGION }
        ],
        peers: currentPeers,
        peersStr: JSON.stringify(currentPeers, null, 2),
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

function queryFromAppClient(appPeer)
{
    if (currentPeers && _.keys(currentPeers).length > 0)
    {
        var peer = currentPeers[_.keys(currentPeers)[0]];
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
