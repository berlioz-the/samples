const _ = require('the-lodash');
const Promise = require('the-promise');
const AWS = require('aws-sdk');
const KinesisConsumer = require('aws-processors/kinesis-consumer');
const request = require('request-promise');

const berlioz = require('berlioz-connector');


berlioz.monitorQueues('jobs', () => {

    var kinesisInfo = berlioz.getQueueInfo('jobs');
    if (!kinesisInfo) {
        console.log('Kinesis Peer not present');
        return;
    }
    var kinesis = new AWS.Kinesis(kinesisInfo.config);
    var consumer = new KinesisConsumer(kinesis)
        .streamName(kinesisInfo.streamName)
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
    var peer = berlioz.getRandomPeer('service', 'dashboard', 'client');
    if (peer) {
        var url = 'http://' + peer.address + ':' + peer.port + '/item';
        data.readyDate = new Date().toISOString();
        return request({ url: url, body:data, method: 'POST', json: true, timeout: 5000 })
            .then(result => {
            })
            .catch(error => {
                console.log(error);
            });
    }
    else
    {
        console.log('Peer not present.');
    }
}
