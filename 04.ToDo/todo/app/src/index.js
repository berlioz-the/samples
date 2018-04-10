// test 1234

const express = require('express')
const app = express()

app.get('/', (request, response) => {
    response.send('Hello from Berlioz App Tier! <br/> App ID: ' + process.env.BERLIOZ_TASK_ID)
})

app.listen(process.env.BERLIOZ_LISTEN_PORT_CLIENT,
           process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_CLIENT}`)
})
