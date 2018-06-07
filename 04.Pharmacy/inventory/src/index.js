const AWS = require('aws-sdk');
const berlioz = require('berlioz-connector');
const express = require('express');

const app = express();
berlioz.setupExpress(app);

app.get('/', (request, response) => {
    response.send({ service: process.env.BERLIOZ_SERVICE,
                    id: process.env.BERLIOZ_TASK_ID });
})

app.post('/item', (request, response) => {
    console.log('*** /item POST ROOT traceId: ' + berlioz.zipkin.tracer.id);
    console.log(JSON.stringify(request.headers));

    var docClient = berlioz.getDatabaseClient('drugs', AWS);
    var params = {
        Item: {
            'name': request.body.name
        }
    };
    docClient.put(params, (err, data) => {
        if (err) {
            response.send(err);
        } else {
            response.send(data);
        }
    });
});

app.get('/items', (request, response) => {
    console.log('*** /items GET ROOT traceId: ' + berlioz.zipkin.tracer.id);
    console.log(JSON.stringify(request.headers));

    var docClient = berlioz.getDatabaseClient('drugs', AWS);
    var params = {
    };
    docClient.scan(params, (err, data) => {
        if (err) {
            console.log('ITEMS ERROR:' + JSON.stringify(err));
            response.send(err);
        } else {
            console.log('ITEMS:' + JSON.stringify(data));
            response.send(data.Items);
        }
    });
});

app.listen(process.env.BERLIOZ_LISTEN_PORT_CLIENT,
           process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_CLIENT}`)
})
