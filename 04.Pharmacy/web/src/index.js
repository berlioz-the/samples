const express = require('express');
const _ = require('lodash');
const Promise = require('promise');
const request = require('request-promise');
const AWS = require('aws-sdk');
const berlioz = require('berlioz-connector');

const app = express()
berlioz.setupExpress(app);

app.use(express.static('public'))
app.set('view engine', 'ejs');

app.get('/', (req, response) => {
    console.log('***/ ROOT traceId: ' + berlioz.zipkin.tracer.id);

    var renderData = { };

    return Promise.serial([queryInventory, queryDashboard], x => x(renderData))
        .catch(error => {
            if (error instanceof Error) {
                renderData.error = error.stack + error.stack;
            } else {
                renderData.error = JSON.stringify(error, null, 2);
            }
        })
        .then(() => {
            response.render('pages/index', renderData);
        })
        ;
})

function queryInventory(renderData)
{
    var options = { url: '/items', json: true };
    return berlioz.request('service', 'inventory', 'client', options)
        .then(result => {
            renderData.drugs = result.body;
        });
}

function queryDashboard(renderData)
{
    var options = { url: '/items', json: true };
    return berlioz.request('service', 'dashboard', 'client', options)
        .then(result => {
            renderData.readyItems = result.body;
        });
}

app.post('/new-drug', (req, response) => {
    // console.log('*** /new-drug ROOT traceId: ' + berlioz.zipkin.tracer.id);
    // console.log('*** /new-drug IN REQUEST traceId: ' + req.tracerId);
    var options = { url: '/item', method: 'POST', body: req.body, json: true };
    return berlioz.request('service', 'inventory', 'client', options)
        .then(result => {
            // console.log(result);
            // response.send(result);
            return response.redirect('/');
        })
        .catch(reason => {
            response.send('ERROR FROM Web::NewDrug ' + JSON.stringify(reason));
        });
});

app.post('/drop-prescription', (req, response) => {
    var body = {
        patient: req.body.patient,
        medication: req.body.medication,
        dropDate: new Date().toISOString()
    };
    var options = { url: '/job', method: 'POST', body: body, json: true };
    return berlioz.request('service', 'clerk', 'client', options)
        .then(result => {
            console.log('/drop-prescription Result: ' + JSON.stringify(result, null, 4));
            return response.redirect('/');
        })
        .catch(error => {
            response.send(error);
        });
});

app.post('/pick-up', (req, response) => {
    var options = { url: '/pick-up', method: 'POST', body: req.body, json: true };
    return berlioz.request('service', 'dashboard', 'client', options)
        .then(body => {
            return response.redirect('/');
        })
        .catch(reason => {
            response.send('ERROR FROM Web::PickUp ' + JSON.stringify(reason));
        });
});

app.listen(process.env.BERLIOZ_LISTEN_PORT_CLIENT, process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_CLIENT}`)
})
