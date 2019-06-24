console.log(JSON.stringify(process.env));

const _ = require('lodash');
const express = require('express');
const berlioz = require('berlioz-sdk');

const app = express();
berlioz.setupExpress(app);

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', function (req, response) {
    var renderData = {
        settings: [
            {name: 'Identity', value: berlioz.identity },
            {name: 'Task ID', value: process.env.BERLIOZ_TASK_ID },
            {name: 'Instance ID', value: process.env.BERLIOZ_INSTANCE_ID },
            {name: 'Region', value: process.env.BERLIOZ_REGION },
            {name: 'Cluster', value: process.env.BERLIOZ_CLUSTER },
            {name: 'Service', value: process.env.BERLIOZ_SERVICE }
        ],
    };
    for(var x of _.keys(process.env)) {
        renderData.settings.push({
            name: 'ENV:: ' + x,
            value: process.env[x]
        })
    }
    return response.render('pages/index', renderData);
})

for(var x of _.keys(process.env)) {
    console.log('ENV:: ' + x + ' => ' + process.env[x]);
}

app.listen(process.env.BERLIOZ_LISTEN_PORT_DEFAULT,
           process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_DEFAULT}`)
})
