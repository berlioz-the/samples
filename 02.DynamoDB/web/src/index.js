const express = require('express')
const _ = require('lodash')
const Promise = require('promise');
const berlioz = require('berlioz-connector');
const bodyParser = require('body-parser');

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))
app.set('view engine', 'ejs');

app.get('/', function (req, response) {
    var renderData = {
        settings: [
            {name: 'Task ID', value: process.env.BERLIOZ_TASK_ID },
            {name: 'Instance ID', value: process.env.BERLIOZ_INSTANCE_ID },
            {name: 'Region', value: process.env.BERLIOZ_AWS_REGION }
        ],
        peers: berlioz.getPeers('service', 'app', 'client'),
        entries: [],
        appPeerInfo: { }
    };

    var appPeer = berlioz.getRandomPeer('service', 'app', 'client');
    if (appPeer) {
        renderData.appPeerInfo.host = appPeer.address + ':' + appPeer.port;
    }

    return Promise.resolve()
        .then(() => {
            var options = { url: '/entries', json: true, timeout: 5000 };
            return berlioz.requestPeer(appPeer, options)
                .then(result => {
                    if (result) {
                        renderData.entries = result.body;
                        renderData.appPeerInfo.url = result.url;
                        renderData.appPeerInfo.cardClass = 'eastern-blue';
                        renderData.appPeerInfo.title = 'RESPONSE:';
                        renderData.appPeerInfo.response = JSON.stringify(result.body, null, 2);
                    } else {
                        renderData.appPeerInfo.cardClass = 'yellow';
                        renderData.appPeerInfo.title = 'No peers present';
                    }
                })
                .catch(error => {
                    renderData.appPeerInfo.url = error.url;
                    renderData.appPeerInfo.cardClass = 'red';
                    renderData.appPeerInfo.title = 'ERROR';
                    renderData.appPeerInfo.response = JSON.stringify(error, null, 2);
                });
        })
        .then(() => {
            var options = { url: '/', json: true, timeout: 5000 };
            return berlioz.requestPeer(appPeer, options)
                .then(result => {
                    if (result) {
                        renderData.appPeerInfo.tableName = result.body.recipeDB.tableName;
                        renderData.appPeerInfo.config = result.body.recipeDB.config;
                        renderData.appDbPeers = result.body.recipeDB;
                    }
                })
                .catch(error => {
                })
                .then(() => {
                    if (!renderData.appPeerInfo.tablename) {
                        renderData.appPeerInfo.tablename = '';
                    }
                });
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
});

app.post('/new-contact', (request, response) => {
    var options = { url: '/entry', method: 'POST', body: request.body, json: true, timeout: 5000 };
    return berlioz.requestRandomPeer('service', 'app', 'client', options)
        .then(result => {
            console.log('**** ' + JSON.stringify(result));
            if (!result) {
                return response.send({ error: 'No app peers present.' });
            }
            return response.send(result.body);
        })
        .catch(error => {
            return response.send({ error: error });
        });
});

berlioz.setupDebugExpressJSRoutes(app);

app.listen(process.env.BERLIOZ_LISTEN_PORT_CLIENT, process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_CLIENT}`)
})