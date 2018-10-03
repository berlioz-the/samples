const express = require('express')
const _ = require('lodash')
const Promise = require('promise')
const berlioz = require('berlioz-connector');
const RedisClustr = require('redis-clustr');
const AWS = require('aws-sdk');
const uuid = require('uuid/v4');

var app = express();
berlioz.setupExpress(app);
app.use(express.static('public'))
app.set('view engine', 'ejs');


var redisClient = null;
berlioz.service("redis").monitorAll(peers => {
    var servers = [];
    if (peers) {
        servers = _.values(peers).map(x => ({ host: x.address, port: x.port }));
    }
    console.log("REDIS SERVERS: " + JSON.stringify(servers));
    redisClient = new RedisClustr({
        servers: servers
    });
})


app.get('/', function (req, response) {
    response.json({})
});


app.get('/amount', function (req, response) {
    return getAmount()
        .then(result => {
            response.json({ value: result });
        })
        .catch(reason => {
            response.statusCode = 500;
            response.json(reason)
        })
});


app.post('/donate', function (req, response) {
    var amount = parseInt(req.body.amount);

    var docClient = berlioz.database('donations').client(AWS);
    var params = {
        Item: {
            id: uuid(),
            date: new Date().toISOString(),
            amount: amount
        }
    };
    return docClient.put(params)
        .then(() => getAmount())
        .then(result => {
            var newVal = result + amount;
            redisClient.set('amount', newVal);
        })
        .then(result => {
            response.json({ value: result });
        })
        .catch(reason => {
            response.statusCode = 500;
            response.json(reason)
        })
});

app.get('/entries', function (req, response) {
    var docClient = berlioz.database('donations').client(AWS);
    return docClient.scan({})
        .then(result => {
            var items = result.Items;
            items = _.orderBy(items, ['date'], ['desc'])
            response.json({ entries: items });
        })
        .catch(reason => {
            response.statusCode = 500;
            response.json(reason)
        })
});

function getAmount()
{
    return new Promise((resolve, reject) => {
        redisClient.get('amount', (err, reply) => {
            if (err) {
                reject(error)
            } else {
                if (reply == null) {
                    resolve(0);
                } else {
                    var value = parseInt(reply);
                    resolve(value);
                }
            }
        })
    })      
} 


app.listen(process.env.BERLIOZ_LISTEN_PORT_DEFAULT, process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_DEFAULT}`)
})
