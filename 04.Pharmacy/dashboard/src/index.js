const AWS = require('aws-sdk');
const berlioz = require('berlioz-connector');
const express = require('express');

const app = express();
berlioz.setupExpress(app);

app.get('/', (request, response) => {
    response.send({ service: process.env.BERLIOZ_SERVICE,
                    id: process.env.BERLIOZ_TASK_ID });
})

app.post('/item', (request, response) => {
    var docClient = berlioz.getDatabaseClient('dash', AWS);
    var params = {
        Item: request.body
    };
    docClient.put(params, (err, data) => {
        if (err) {
            response.send(err);
        } else {
            response.send(data);
        }
    });
});

app.get('/items', (request, response) => {
    var docClient = berlioz.getDatabaseClient('dash', AWS);
    var params = {
    };
    docClient.scan(params, (err, data) => {
        if (err) {
            response.send(err);
        } else {
            response.send(data.Items);
        }
    });
});

app.post('/pick-up', (request, response) => {
    var docClient = berlioz.getDatabaseClient('dash', AWS);
    var params = {
        Key: {
            'patient': request.body.patient
        }
    };
    docClient.delete(params, (err, data) => {
        if (err) {
            response.send(err);
        } else {
            response.send(data);
        }
    });
});

app.listen(process.env.BERLIOZ_LISTEN_PORT_CLIENT,
           process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_CLIENT}`)
})
