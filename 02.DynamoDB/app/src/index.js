const AWS = require('aws-sdk');
const express = require('express');
const berlioz = require('berlioz-connector');

const app = express();
berlioz.setupExpress(app);

app.get('/', (request, response) => {
    var data = {
        myId: process.env.BERLIOZ_TASK_ID,
        message: 'Hello From App Tier',
        recipeDB: berlioz.getDatabaseInfo('contacts')
    }
    response.send(data);
})

app.get('/entries', (request, response) => {
    var docClient = berlioz.getDatabaseClient('contacts', AWS);
    var params = {
    };
    return docClient.scan(params)
        .then(data => {
            response.send(data.Items);
        })
        .catch(err => {
            response.send({error: err});
        });
})

app.post('/entry', (request, response) => {
    if (!request.body.name || !request.body.phone) {
        return response.send({error: 'Missing name or phone'});
    }

    var docClient = berlioz.getDatabaseClient('contacts', AWS);
    var params = {
        Item: {
            'name': request.body.name,
            'phone': request.body.phone
        }
    };
    return docClient.put(params)
        .then(data => {
            response.send(data);
        })
        .catch(err => {
            response.send({error: err});
        });
})

app.listen(process.env.BERLIOZ_LISTEN_PORT_CLIENT,
           process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_CLIENT}`)
})
