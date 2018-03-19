const express = require('express')
const app = express()
const port = 4000

app.get('/', (request, response) => {
    response.send('Hello from Berlioz App Tier!')
})

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
})
