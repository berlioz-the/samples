var AWS = require('aws-sdk');


const express = require('express')
const berlioz = require('berlioz-connector');

const app = express()

app.get('/', (request, response) => {
    response.send('Hello from Berlioz App Tier! <br/> App ID: ' + process.env.BERLIOZ_TASK_ID)
})

app.get('/peers', (req, response) => {
    response.setHeader('Content-Type', 'application/json');
    response.send(JSON.stringify(berlioz.extractRoot()));
})

app.get('/db', (req, response) => {
    var dbInfo = berlioz.getDatabaseInfo('recipes');
    var docClient = new AWS.DynamoDB.DocumentClient(dbInfo.config);

    var params = {
        TableName: dbInfo.tableName,
        Item: {
            'myId': '1234',
            'full_name': 'zzasdfasdf',
            'eee': 'ddd'
        }
    };
    docClient.put(params, (err, data) => {
        if (err) {
            response.send(err);
        } else {
            response.send(JSON.stringify(data));
        }
    });
})

app.get('/test', (req, response) => {
    var data = berlioz.getDatabaseInfo('recipes');
    response.setHeader('Content-Type', 'application/json');
    response.send(JSON.stringify(data));
})

app.listen(process.env.BERLIOZ_LISTEN_PORT_CLIENT,
           process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_CLIENT}`)
})
