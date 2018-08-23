const AWS = require('aws-sdk');
const express = require('express')
const Promise = require('promise');
const berlioz = require('berlioz-connector');

const app = express();
berlioz.setupExpress(app);

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', function (req, response) {
    var renderData = {
        settings: [
            {name: 'Task ID', value: process.env.BERLIOZ_TASK_ID },
            {name: 'Instance ID', value: process.env.BERLIOZ_INSTANCE_ID },
            {name: 'Region', value: process.env.BERLIOZ_REGION }
        ]
    };

    var queueInfo = berlioz.queue('jobs').first();
    if (queueInfo) {
        renderData.kinesisInfo = {
            name: queueInfo.name,
            region: queueInfo.config.region
        };
    } else {
        renderData.kinesisInfo = {};
    }

    var dynamoInfo = berlioz.database('arts').first();
    if (dynamoInfo) {
        renderData.dynamoInfo = {
            name: dynamoInfo.name,
            region: dynamoInfo.config.region
        };
    } else {
        renderData.dynamoInfo = {};
    }

    return Promise.resolve()
        .then(() => {
            var docClient = berlioz.database('arts').client(AWS);
            var params = {
            };
            return docClient.scan(params)
                .then(data => {
                    renderData.entries = data.Items;
                })
                .catch(reason => {
                    console.log(reason);
                });
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
    return Promise.resolve()
        .then(() => {
            var docClient = berlioz.database('arts').client(AWS);
            var params = {
                Item: {
                    'name': request.body.name,
                    'art': 'Render in progress... Refresh in few seconds...'
                }
            };
            return docClient.put(params);
        })
        .then(() => {
            var kinesis = berlioz.queue('jobs').client(AWS);
            var params = {
                PartitionKey: request.body.name,
                Data: JSON.stringify(request.body)
            };
            return kinesis.putRecord(params)
                .then(data => {
                    response.send({result: data});
                })
                .catch(reason => {
                    response.send({error: err});
                });
        })
})

app.listen(process.env.BERLIOZ_LISTEN_PORT_DEFAULT, process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_DEFAULT}`)
})
