const express = require('express')

const berlioz = require('berlioz-connector');
var dbClientEndpoints = null;
berlioz.monitorPeers('service', 'db', 'client', peers => {
    dbClientEndpoints = peers;
});

const app = express()
app.get('/', (request, response) => {
    var data = {
        myId: process.env.BERLIOZ_TASK_ID,
        message: 'Hello From App Tier',
        myDbPeers: dbClientEndpoints
    }
    response.send(data);
})

app.listen(process.env.BERLIOZ_LISTEN_PORT_CLIENT,
           process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_CLIENT}`)
})
