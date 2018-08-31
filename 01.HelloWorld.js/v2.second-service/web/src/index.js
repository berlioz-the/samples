const express = require('express')
const Promise = require('promise');
const berlioz = require('berlioz-connector');

const app = express();
berlioz.setupExpress(app);

app.use(express.static('public'))
app.set('view engine', 'ejs');

app.get('/', function (req, response) {
    var renderData = {
        settings: [
            {name: 'Task ID', value: process.env.BERLIOZ_TASK_ID },
            {name: 'Instance ID', value: process.env.BERLIOZ_INSTANCE_ID },
            {name: 'Region', value: process.env.BERLIOZ_REGION }
        ],
        peers: berlioz.service('app').all(),
        appPeer: { }
    };

    return Promise.resolve()
        .then(() => {
            var options = { url: '/', json: true, resolveWithFullResponse: true };
            return berlioz.service('app').request(options)
                .then(result => {
                    if (result) {
                        renderData.appPeer.url = result.url;
                        renderData.appPeer.cardClass = 'eastern-blue';
                        renderData.appPeer.title = 'RESPONSE:';
                        renderData.appPeer.response = JSON.stringify(result.body, null, 2);
                    } else {
                        renderData.appPeer.cardClass = 'yellow';
                        renderData.appPeer.title = 'No peers present';
                    }
                })
                .catch(error => {
                    renderData.appPeer.url = error.url;
                    renderData.appPeer.cardClass = 'red';
                    renderData.appPeer.title = 'ERROR';
                    if (error.message) {
                        renderData.appPeer.response = error.message
                    } else {
                        renderData.appPeer.response = JSON.stringify(error, null, 2);
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
        });
});


app.listen(process.env.BERLIOZ_LISTEN_PORT_DEFAULT, process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_DEFAULT}`)
})
