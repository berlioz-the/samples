const express = require('express')
const berlioz = require('berlioz-connector');
const mysql = require('promise-mysql');

function executeQuery(querySql)
{
    var conn = null;
    var finalResult = null;
    var peer = berlioz.getRandomPeer('service', 'db', 'client');
    var options = {
        host: peer.address,
        port: peer.port,
        user: process.env.HELLO_RELATIONAL_DB_USER,
        password: process.env.HELLO_RELATIONAL_DB_PASS,
        database: process.env.HELLO_RELATIONAL_DB_NAME,
        insecureAuth: true
    };
    return mysql.createConnection(options)
        .then(result => {
            conn = result;
            return conn.query(querySql);
        })
        .then(result => {
            finalResult = result;
        })
        .finally(() => conn.end())
        .then(() => finalResult);
}

//
// return executeQuery('select * from addressBook')
//     .then(rows => {
//         console.log(rows);
//     })
//     .then(() => executeQuery('select * from addressBook'))
//     .then(rows => {
//         var row = rows[0];
//         console.log(JSON.stringify(row));
//     })
//     ;


const app = express()
app.get('/', (request, response) => {
    var data = {
        myId: process.env.BERLIOZ_TASK_ID,
        message: 'Hello From App Tier',
        myDbPeers: berlioz.getPeers('service', 'db', 'client')
    }
    response.send(data);
})

app.get('/entries', (request, response) => {
    return executeQuery('select * from addressBook')
        .then(rows => {
            response.send(rows);
        })
})

app.listen(process.env.BERLIOZ_LISTEN_PORT_CLIENT,
           process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_CLIENT}`)
})
