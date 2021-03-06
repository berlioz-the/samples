const _ = require('lodash');
const express = require('express');
const berlioz = require('berlioz-sdk');
const {Storage} = require('@google-cloud/storage');
const PubSub = require('@google-cloud/pubsub');

const app = express();
berlioz.setupExpress(app);
berlioz.addon(require('berlioz-gcp'));

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

    return Promise.resolve()
        .then(() => berlioz.database('users').client(Storage).getFiles())
        .then(result => {
            var names = result.map(x => x.name);
            renderData.settings.push({
                name: 'RESULT:: ',
                value: JSON.stringify(names)
            })
        })
        .then(() => publishSampleMessage())
        .catch(reason => {
            renderData.settings.push({
                name: 'ERROR:: ',
                value: reason.message
            })
        })
        .then(() => response.render('pages/index', renderData));
})

function publishSampleMessage()
{
    const msg = {
        messages: [
            {
                data: Buffer.from("world")
            }
        ],
    };
    if (!PubSub) {
        throw new Error("PubSub is NULL");
    }
    if (!PubSub.v1) {
        throw new Error("PubSub.v1 is NULL");
    }
    if (!PubSub.v1.PublisherClient) {
        throw new Error("PubSub.v1.PublisherClient is NULL");
    }
    return berlioz.queue('jobs').client(PubSub, 'PublisherClient').publish(msg);
}

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
