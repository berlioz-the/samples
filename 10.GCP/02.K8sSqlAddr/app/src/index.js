const express = require('express');
const berlioz = require('berlioz-sdk');
const mysql = require('promise-mysql');
const _ = require('lodash');
const Promise = require('promise');

const app = express();
berlioz.setupExpress(app);

app.get('/', (request, response) => {
    var data = {
        myId: process.env.BERLIOZ_TASK_ID,
        message: 'Hello From App Tier',
        myDbPeers: berlioz.database('book').all()
    }
    response.send(data);
})

app.get('/entries', (request, response) => {
    return executeQuery('SELECT * FROM contacts')
        .then(result => {
            response.send(result);
        })
        .catch(reason => {
            response.status(400).send({
               error: reason.message
            });
        })
})

app.post('/entry', (request, response) => {
    if (!request.body.name || !request.body.phone) {
        return response.send({error: 'Missing name or phone'});
    }
    var querySql = `INSERT INTO contacts(name, phone) VALUES('${request.body.name}', '${request.body.phone}')`;
    return executeQuery(querySql)
        .then(result => {
            response.send(result);
        })
        .catch(reason => {
            response.status(400).send({
               error: reason.message
            });
        })
})

function executeQuery(querySql)
{
    return Promise.resolve(getConnection())
        .then(connection => {
            return connection.query(querySql);
        })
}

app.listen(process.env.BERLIOZ_LISTEN_PORT_DEFAULT,
           process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_DEFAULT}`)
})

var mysqlConfig = {
    connection: null,
    config: null
};

berlioz.database('book').monitorFirst(peer => {
    if (peer) {
        mysqlConfig.config = _.clone(peer.config);
        mysqlConfig.config.user = 'root';
        mysqlConfig.config.password = '';
        mysqlConfig.config.database = 'demo';
    } else {
        mysqlConfig.config = null;
        mysqlConfig.connection = null;
    }
});

function getConnection()
{
    if (mysqlConfig.connection) {
        return mysqlConfig.connection;
    }
    if (!mysqlConfig.config) {
        throw new Error('Database Not Present.');
    }

    console.log("Connecting to DB:");
    console.log(mysqlConfig.config);
    return Promise.resolve(mysql.createConnection(mysqlConfig.config))
        .then(result => {
            mysqlConfig.connection = result;
        })
        .catch(reason => {
            console.log("ERROR Connecting to DB:");
            console.log(reason);
            throw new Error('Database Not Connected.');
        })
}
