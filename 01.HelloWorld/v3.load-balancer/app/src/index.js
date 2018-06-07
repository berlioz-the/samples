const express = require('express');
const berlioz = require('berlioz-connector');

const app = express();
berlioz.setupExpress(app);

app.get('/', (request, response) => {
    response.send({
        message: 'Hello from App Tier',
        appId: process.env.BERLIOZ_TASK_ID
    });
})

app.listen(process.env.BERLIOZ_LISTEN_PORT_CLIENT,
           process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_CLIENT}`)
});
