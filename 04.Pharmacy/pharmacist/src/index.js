const _ = require('the-lodash');
const Promise = require('the-promise');
const AWS = require('aws-sdk');
const KinesisConsumer = require('aws-processors/kinesis-consumer');
const request = require('request-promise');

const berlioz = require('berlioz-connector');


berlioz.queue('jobs').monitorFirst(kinesisInfo => {
    if (!kinesisInfo) {
        console.log('Kinesis Peer not present');
        return;
    }
    var kinesis = new AWS.Kinesis(kinesisInfo.config);
    var consumer = new KinesisConsumer(kinesis)
        .streamName(kinesisInfo.name)
        .shouldParseJson(true)
        .handler(data => {
            return processData(data);
        })
        .process()
        ;

});

function processData(data)
{
    console.log('Processing: ' + JSON.stringify(data));

    data.readyDate = new Date().toISOString();
    var options = { url: '/item', body:data, method: 'POST', json: true}
    return berlioz.service('dashboard').request(options)
        .then(result => {
        })
        .catch(error => {
            console.log(error);
        });
}
