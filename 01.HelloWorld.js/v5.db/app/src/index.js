const express = require('express');
const berlioz = require('berlioz-sdk');
const mysql = require('promise-mysql');

const app = express();
berlioz.setupExpress(app);

app.get('/', (request, response) => {
    var data = {
        myId: process.env.BERLIOZ_TASK_ID,
        message: 'Hello From App Tier',
        myDbPeers: berlioz.service('db').all()
    }
    response.send(data);
})

app.get('/entries', (request, response) => {
    return executeQuery('select * from addressBook')
        .then(result => {
            response.send(result);
        })
})

app.post('/entry', (request, response) => {
    if (!request.body.name || !request.body.phone) {
        return response.send({error: 'Missing name or phone'});
    }
    var querySql = 'INSERT INTO `addressBook`(`name`, `phone`) VALUES(\'' + request.body.name + '\', \'' + request.body.phone + '\')';
    return executeQuery(querySql)
        .then(result => {
            response.send(result);
        })
})

function executeQuery(querySql)
{
    var peer = berlioz.service('db').random();
    if (!peer) {
        return Promise.resolve(null);
    }

    var options = {
        host: peer.address,
        port: peer.port,
        user: process.env.HELLO_RELATIONAL_DB_USER,
        password: process.env.HELLO_RELATIONAL_DB_PASS,
        database: process.env.HELLO_RELATIONAL_DB_NAME,
        insecureAuth: true
    };

    var conn = null;
    var finalResult = null;
    return mysql.createConnection(options)
        .then(result => {
            conn = result;
            return conn.query(querySql);
        })
        .then(result => {
            finalResult = result;
        })
        .finally(() => {
            if (conn) {
                return conn.end();
            }
        })
        .then(() => finalResult);
}


app.listen(process.env.BERLIOZ_LISTEN_PORT_DEFAULT,
           process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_DEFAULT}`)
})
