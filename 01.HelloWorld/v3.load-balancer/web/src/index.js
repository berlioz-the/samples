const express = require('express')
const _ = require('lodash')
const request = require('request-promise');
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

app.get('/', function (req, response) {
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
