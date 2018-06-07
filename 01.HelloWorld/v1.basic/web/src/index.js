const _ = require('lodash');
const Promise = require('promise');
const express = require('express');
const berlioz = require('berlioz-connector');

const app = express()

const {Tracer, BatchRecorder, jsonEncoder: {JSON_V2},  ExplicitContext, ConsoleRecorder} = require('zipkin');
const {HttpLogger} = require('zipkin-transport-http');
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
const CLSContext = require('zipkin-context-cls');
// const ctxImpl = new ExplicitContext();
const ctxImpl = new CLSContext('zipkin');
const localServiceName = 'service-a'; // name of this application
// const recorder = new ConsoleRecorder();
const recorder = new BatchRecorder({
  logger: new HttpLogger({
    endpoint: 'http://172.17.0.10:9411/api/v2/spans',
    jsonEncoder: JSON_V2, // optional, defaults to JSON_V1
    httpInterval: 1000 // how often to sync spans. optional, defaults to 1000
  })
});
const tracer = new Tracer({ctxImpl, recorder, localServiceName});

const wrapRequest = require('zipkin-instrumentation-request');
const request = require('request');
const remoteServiceName = 'weather-api';
const zipkinRequest = wrapRequest(request, {tracer, remoteServiceName});

app.use(zipkinMiddleware({tracer}));

app.use(express.static('public'))
app.set('view engine', 'ejs')

console.log('Root TraceID: ', tracer.id.traceId);

app.get('/', function (req, response) {

    var renderData = {
        settings: [
            {name: 'Task ID', value: process.env.BERLIOZ_TASK_ID },
            {name: 'Instance ID', value: process.env.BERLIOZ_INSTANCE_ID },
            {name: 'Region', value: process.env.BERLIOZ_REGION },
            {name: 'Cluster', value: process.env.BERLIOZ_CLUSTER },
            {name: 'Service', value: process.env.BERLIOZ_SERVICE }
        ]
    };

    zipkinRequest({
        url: 'http://api.weather.com',
        method: 'GET',
    }, (error, wr, body) => {
        console.log('error:', error);
        console.log('statusCode:', wr && wr.statusCode);
        console.log('body:', body);
        renderData.settings.push({
            name: 'weather',
            value: JSON.stringify(wr)
        });

        return response.render('pages/index', renderData);
      });


})

app.get('/service1/:id', function (req, response) {

    var requestId = req.params.id;
    console.log(' ' + requestId + '=> Incoming request trace ID: ' + tracer.id.traceId + ', spanId:' + tracer.id.traceId);

    return Promise.resolve()
        .then(() => {
            console.log(' ' + requestId + '=> Inside Promise trace ID: ' + tracer.id.traceId+ ', spanId:' + tracer.id.traceId);
            return getRemoteOne(requestId);
        })
        .then(() => {
            console.log(' ' + requestId + '=> Inside Promise trace ID: ' + tracer.id.traceId+ ', spanId:' + tracer.id.traceId);
            return getRemoteOne(requestId);
        })
        .then(() => {
            console.log(' ' + requestId + '=> Inside Promise trace ID: ' + tracer.id.traceId+ ', spanId:' + tracer.id.traceId);
            return getRemoteOne(requestId);
        })
        .then(data => {
            console.log(' ' + requestId + '=> Inside Promise Result trace ID: ' + tracer.id.traceId+ ', spanId:' + tracer.id.traceId);
            return response.send(data);
        })

})

function getRemoteOne(requestId)
{
    console.log(' ' + requestId + '=> Inside getRemoteOne trace ID: ' + tracer.id.traceId+ ', spanId:' + tracer.id.traceId);
    return new Promise(function(resolve, reject) {
        console.log(' ' + requestId + '=> Inside getRemoteOne Promise trace ID: ' + tracer.id.traceId+ ', spanId:' + tracer.id.traceId);
        setTimeout(() => {
           console.log(' ' + requestId + '=> Inside Timer trace ID: ' + tracer.id.traceId+ ', spanId:' + tracer.id.traceId);

            zipkinRequest({
                url: 'http://api.weather.com',
                method: 'GET',
            }, (error, wr, body) => {
                console.log(' ' + requestId + '=> Weather Response trace ID: ' + tracer.id.traceId+ ', spanId:' + tracer.id.traceId);

                resolve(wr.body);
              });

        }, 500);
    });
}

berlioz.setupDebugExpressJSRoutes(app);

app.listen(process.env.BERLIOZ_LISTEN_PORT_CLIENT,
           process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_CLIENT}`)
})
