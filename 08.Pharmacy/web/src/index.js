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
        drugs: [],
        readyItems: []
    };

    return Promise.resolve()
        .then(() => {
            var peer = berlioz.getRandomPeer('service', 'registry_app', 'client');
            if (peer) {
                var url = 'http://' + peer.address + ':' + peer.port + '/items';
                return request({ url: url, json: true, timeout: 5000 })
                    .then(result => {
                        renderData.drugs = result;
                    });
            }
        })
        .then(() => {
            var peer = berlioz.getRandomPeer('service', 'dash_app', 'client');
            if (peer) {
                var url = 'http://' + peer.address + ':' + peer.port + '/items';
                return request({ url: url, json: true, timeout: 5000 })
                    .then(result => {
                        renderData.readyItems = result;
                    });
            }
        })
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
    return request({ url: url, body: req.body, method: 'POST', json: true, timeout: 5000 })
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
    var body = {
        patient: req.body.patient,
        medication: req.body.medication,
        dropDate: new Date().toISOString()
    };
    var requestData = { url: url, body: body, method: 'POST', json: true, timeout: 5000 };
    console.log('In /drop-prescription: ' + JSON.stringify(requestData, null, 4));
    return request(requestData)
        .then(result => {
            console.log('/drop-prescription Result: ' + JSON.stringify(result, null, 4));
            return response.redirect('/');
        })
        .catch(error => {
            response.send(error);
        });
});

app.post('/pick-up', (req, response) => {
    var peer = berlioz.getRandomPeer('service', 'dash_app', 'client');
    if (!peer) {
        return response.status(503).send('Peer Unavailable.');
    }
    var url = 'http://' + peer.address + ':' + peer.port + '/pick-up';
    return request({ url: url, body: req.body, method: 'POST', json: true, timeout: 5000 })
        .then(body => {
            return response.redirect('/');
        })
        .catch(reason => {
            response.send('ERROR FROM Web::PickUp ' + JSON.stringify(reason));
        });
});

// app.get('/debug', (req, response) => {
//     var appClientEndpoints = {};
//     var renderData = {
//         settings: [
//             {name: 'Task ID', value: process.env.BERLIOZ_TASK_ID },
//             {name: 'Instance ID', value: process.env.BERLIOZ_INSTANCE_ID },
//             {name: 'Region', value: process.env.BERLIOZ_AWS_REGION }
//         ],
//         peers: appClientEndpoints,
//         peersStr: JSON.stringify(appClientEndpoints, null, 2),
//         appPeer: {
//         }
//     };
//
//     return Promise.resolve()
//         // .then(() => queryFromAppClient(renderData.appPeer))
//         .catch(error => {
//             if (error instanceof Error) {
//                 renderData.error = error.stack + error.stack;
//             } else {
//                 renderData.error = JSON.stringify(error, null, 2);
//             }
//         })
//         .then(() => {
//             response.render('pages/debug', renderData);
//         })
//         ;
// })
//
// app.get('/peers', (req, response) => {
//     response.send(berlioz.extractRoot());
// })

app.listen(process.env.BERLIOZ_LISTEN_PORT_CLIENT, process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_CLIENT}`)
})
