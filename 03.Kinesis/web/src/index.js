const AWS = require('aws-sdk');
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
        ]
    };

    var queueInfo = berlioz.getQueueInfo('messages');
    if (queueInfo) {
        renderData.kinesisInfo = {
            name: queueInfo.streamName,
            region: queueInfo.config.region
        };
    } else {
        renderData.kinesisInfo = {};
    }

    var dynamoInfo = berlioz.getDatabaseInfo('arts');
    if (dynamoInfo) {
        renderData.dynamoInfo = {
            name: dynamoInfo.tableName,
            region: dynamoInfo.config.region
        };
    } else {
        renderData.dynamoInfo = {};
    }

    return Promise.resolve()
        .then(() => {
            if (dynamoInfo) {
                var docClient = new AWS.DynamoDB.DocumentClient(dynamoInfo.config);
                var params = {
                    TableName: dynamoInfo.tableName
                };
                return docClient.scan(params).promise()
                    .then(data => {
                        renderData.entries = data.Items;
                    })
                    .catch(reason => {
                        console.log(reason);
                    });
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
            if (!renderData.entries) {
                renderData.entries = [];
            }
        })
        .then(() => {
            response.render('pages/index', renderData);
        })
        ;
});

app.post('/new-job', (request, response) => {
    if (!request.body.name) {
        return response.send({error: 'Missing name'});
    }
    var kinesisInfo = berlioz.getQueueInfo('messages');
    var kinesis = new AWS.Kinesis(kinesisInfo.config);

    var params = {
        StreamName: kinesisInfo.streamName,
        PartitionKey: request.body.name,
        Data: JSON.stringify(request.body)
    };
    return kinesis.putRecord(params).promise()
        .then(data => {
            response.send({result: data});
        })
        .catch(reason => {
            response.send({error: err});
        });
})


berlioz.setupDebugExpressJSRoutes(app);

app.listen(process.env.BERLIOZ_LISTEN_PORT_CLIENT, process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_CLIENT}`)
})
