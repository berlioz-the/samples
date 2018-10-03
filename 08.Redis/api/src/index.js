const express = require('express')
const _ = require('lodash')
const Promise = require('promise')
const berlioz = require('berlioz-connector');
const RedisClustr = require('redis-clustr');

const app = express();
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
    return getAmount()
        .then(result => {
            var newVal = result + 10;
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
