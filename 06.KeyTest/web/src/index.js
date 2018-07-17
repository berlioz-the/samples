const express = require('express');
const AWS = require('aws-sdk');
const berlioz = require('berlioz-connector');

const app = express();
berlioz.setupExpress(app);

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', function (req, response) {
    console.log('ROOT /');

    var renderData = {
        settings: [
            {name: 'Task ID', value: process.env.BERLIOZ_TASK_ID },
            {name: 'Instance ID', value: process.env.BERLIOZ_INSTANCE_ID },
            {name: 'Region', value: process.env.BERLIOZ_REGION },
            {name: 'Cluster', value: process.env.BERLIOZ_CLUSTER },
            {name: 'Service', value: process.env.BERLIOZ_SERVICE }
        ]
    };
    return response.render('pages/index', renderData);
})

app.get('/secret', function (req, response) {
    console.log('*******************************');
    berlioz.getSecret('personal', AWS).encrypt('lalala')
        .then(result => {
            console.log('11111111111111111111111111111');
            console.log(result);
            return berlioz.getSecret('personal', AWS).decrypt(result)
        })
        .then(result => {
            console.log('222222222222222222222222222222');
            console.log(result);
            response.send(result);
        })
        .catch(reason => {
            console.log('333333333333333333333333333333');
            console.log(reason);
            response.send(reason);
        })
})

app.get('/encrypt', function (req, response) {
    console.log('*******************************');
    berlioz.getSecret('personal', AWS).encrypt('lalala')
        .then(result => {
            console.log('11111111111111111111111111111');
            console.log(result);
            response.send(result);
        })
        .catch(reason => {
            console.log('333333333333333333333333333333');
            console.log(reason);
            response.send(reason);
        })
})

app.listen(process.env.BERLIOZ_LISTEN_PORT_CLIENT,
           process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_CLIENT}`)
})
