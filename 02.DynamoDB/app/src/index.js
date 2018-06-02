const AWS = require('aws-sdk');
const express = require('express')
const berlioz = require('berlioz-connector');
const bodyParser = require('body-parser');

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (request, response) => {
    var data = {
        myId: process.env.BERLIOZ_TASK_ID,
        message: 'Hello From App Tier',
        recipeDB: berlioz.getDatabaseInfo('contacts')
    }
    response.send(data);
})

app.get('/entries', (request, response) => {
    var dbInfo = berlioz.getDatabaseInfo('contacts');
    if (!dbInfo) {
        return response.send({error: 'DynamoDb not present'});
    }

    var docClient = new AWS.DynamoDB.DocumentClient(dbInfo.config);
    var params = {
        TableName: dbInfo.tableName
    };
    docClient.scan(params, (err, data) => {
        if (err) {
            response.send({error: err});
        } else {
            response.send(data.Items);
        }
    });
})

app.post('/entry', (request, response) => {
    if (!request.body.name || !request.body.phone) {
        return response.send({error: 'Missing name or phone'});
    }

    var dbInfo = berlioz.getDatabaseInfo('contacts');
    if (!dbInfo) {
        return response.send({error: 'DynamoDb not present'});
    }

    var docClient = new AWS.DynamoDB.DocumentClient(dbInfo.config);
    var params = {
        TableName: dbInfo.tableName,
        Item: {
            'name': request.body.name,
            'phone': request.body.phone
        }
    };
    docClient.put(params, (err, data) => {
        if (err) {
            response.send({error: err});
        } else {
            response.send(data);
        }
    });
})

function executeQuery(querySql)
{

}


app.listen(process.env.BERLIOZ_LISTEN_PORT_CLIENT,
           process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_CLIENT}`)
})
