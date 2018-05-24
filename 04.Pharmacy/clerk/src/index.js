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

app.post('/job', (request, response) => {
    var kinesisInfo = berlioz.getQueueInfo('jobs');
    var kinesis = new AWS.Kinesis(kinesisInfo.config);

    var params = {
        StreamName: kinesisInfo.streamName,
        PartitionKey: request.body.patient,
        Data: JSON.stringify(request.body)
    };
    console.log('Kinesis::Put ' + JSON.stringify(params, null, 2));
    return kinesis.putRecord(params).promise()
        .then(data => {
            response.send(data);
        })
        .catch(reason => {
            response.send('ERROR FROM Kinesis::PutRecord ' + JSON.stringify(reason));
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
