const AWS = require('aws-sdk');
const berlioz = require('berlioz-connector');
const express = require('express');

const app = express();
berlioz.setupExpress(app);

app.get('/', (request, response) => {
    response.send({ service: process.env.BERLIOZ_SERVICE,
                    id: process.env.BERLIOZ_TASK_ID });
})

app.post('/job', (request, response) => {
    var kinesis = berlioz.queue('jobs').client(AWS);
    var params = {
        PartitionKey: request.body.patient,
        Data: JSON.stringify(request.body)
    };
    return kinesis.putRecord(params, (err, data) => {
        if (err) {
            response.send('ERROR FROM Kinesis::PutRecord ' + JSON.stringify(reason));
        } else {
            response.send(data);
        }
    });
});

app.listen(process.env.BERLIOZ_LISTEN_PORT_DEFAULT,
           process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_DEFAULT}`)
})
