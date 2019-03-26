const express = require('express')
const Promise = require('promise');
const berlioz = require('berlioz-sdk');

const app = express();
berlioz.setupExpress(app);

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', function (req, response) {
    var renderData = {
        entries: []
    };

    var options = { url: '/entries', json: true, resolveWithFullResponse: true };
    return berlioz.service('app').request(options)
        .then(result => {
            if (result) {
                renderData.entries = result.body;
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
});

app.post('/new-contact', (request, response) => {
    var options = { url: '/entry', method: 'POST', body: request.body, json: true };
    return berlioz.service('app').request(options)
        .then(result => {
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
