const _ = require('lodash');
const Promise = require('promise');
const express = require('express');
const berlioz = require('berlioz-connector');

const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', function (req, response) {

    var renderData = {
        settings: [
            {name: 'Task ID', value: process.env.BERLIOZ_TASK_ID },
            {name: 'Instance ID', value: process.env.BERLIOZ_INSTANCE_ID },
            {name: 'Region', value: process.env.BERLIOZ_AWS_REGION },
            {name: 'Cluster', value: process.env.BERLIOZ_CLUSTER },
            {name: 'Service', value: process.env.BERLIOZ_SERVICE }
        ]
    };

    return response.render('pages/index', renderData);
})

berlioz.setupDebugExpressJSRoutes(app);

app.listen(process.env.BERLIOZ_LISTEN_PORT_CLIENT,
           process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_CLIENT}`)
})
