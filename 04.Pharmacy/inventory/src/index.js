const AWS = require('aws-sdk');
const berlioz = require('berlioz-connector');
const express = require('express')
const bodyParser = require('body-parser');

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (request, response) => {
    response.send({ service: process.env.BERLIOZ_SERVICE,
                    id: process.env.BERLIOZ_TASK_ID });
})

app.post('/item', (request, response) => {
    var dbInfo = berlioz.getDatabaseInfo('drugs');
    var docClient = new AWS.DynamoDB.DocumentClient(dbInfo.config);

    var params = {
        TableName: dbInfo.tableName,
        Item: {
            'name': request.body.name
        }
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
    var dbInfo = berlioz.getDatabaseInfo('drugs');
    var docClient = new AWS.DynamoDB.DocumentClient(dbInfo.config);

    var params = {
        TableName: dbInfo.tableName
    };
    docClient.scan(params, (err, data) => {
        if (err) {
            response.send(err);
        } else {
            response.send(data.Items);
        }
    });
});

app.get('/peers', (req, response) => {
    response.send(berlioz.extractRoot());
});

app.get('/env', (req, response) => {
    response.send(process.env);
});

app.listen(process.env.BERLIOZ_LISTEN_PORT_CLIENT,
           process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_CLIENT}`)
})
