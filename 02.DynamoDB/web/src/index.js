const express = require('express')
const Promise = require('promise');
const _ = require('the-lodash');
const berlioz = require('berlioz-connector');

const app = express();
berlioz.setupExpress(app);

app.use(express.static('public'))
app.set('view engine', 'ejs');
app.locals._ = _;

app.get('/', function (req, response) {
    var renderData = {
        settings: [
            {name: 'Task ID', value: process.env.BERLIOZ_TASK_ID },
            {name: 'Instance ID', value: process.env.BERLIOZ_INSTANCE_ID },
            {name: 'Region', value: process.env.BERLIOZ_REGION }
        ],
        peers: berlioz.service('app').all(),
        entries: [],
        appPeerInfo: { }
    };

    return Promise.resolve()
        .then(() => {
            var options = { url: '/entries', json: true };
            return berlioz.service('app').request(options)
                .then(result => {
                    if (result) {
                        renderData.entries = result;
                        renderData.appPeerInfo.url = result.url;
                        renderData.appPeerInfo.cardClass = 'eastern-blue';
                        renderData.appPeerInfo.title = 'RESPONSE:';
                        renderData.appPeerInfo.response = JSON.stringify(result, null, 2);
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
            var options = { url: '/', json: true };
            return berlioz.service('app').request(options)
                .then(result => {
                    if (result) {
                        renderData.appPeerInfo.tableName = result.recipeDB.name;
                        renderData.appPeerInfo.config = result.recipeDB.config;
                        renderData.appPeerInfo.host = result.url;
                        renderData.appDbPeers = result.recipeDB;
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
    var options = { url: '/entry', method: 'POST', body: request.body, json: true };
    return berlioz.service('app').request(options)
        .then(result => {
            console.log('**** ' + JSON.stringify(result));
            if (!result) {
                return response.send({ error: 'No app peers present.' });
            }
            return response.send(result);
        })
        .catch(error => {
            return response.send({ error: error });
        });
});

app.listen(process.env.BERLIOZ_LISTEN_PORT_DEFAULT, process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_DEFAULT}`)
})
