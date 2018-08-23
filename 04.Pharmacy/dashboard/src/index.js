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
    var docClient = berlioz.database('dash').client(AWS);
    var params = {
        Item: request.body
    };
    return docClient.put(params)
        .then(data => {
            response.send(data);
        })
        .catch(err => {
            response.send(err);
        });
});

app.get('/items', (request, response) => {
    var docClient = berlioz.database('dash').client(AWS);
    var params = {
    };
    return docClient.scan(params)
        .then(data => {
            response.send(data.Items);
        })
        .catch(err => {
            response.send(err);
        });
});

app.post('/pick-up', (request, response) => {
    var docClient = berlioz.database('dash').client(AWS);
    var params = {
        Key: {
            'patient': request.body.patient
        }
    };
    return docClient.delete(params)
        .then(data => {
            response.send(data);
        })
        .catch(err => {
            response.send(err);
        });
});

app.listen(process.env.BERLIOZ_LISTEN_PORT_DEFAULT,
           process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_DEFAULT}`)
})
