const _ = require('the-lodash');
const Promise = require('the-promise');
const AWS = require('aws-sdk');
const KinesisConsumer = require('aws-processors/kinesis-consumer');

const berlioz = require('berlioz-connector');


berlioz.monitorQueues('work_tasks', () => {

    var kinesisInfo = berlioz.getQueueInfo('work_tasks');
    if (!kinesisInfo) {
        console.log('Kinesis Peer not present');
        return;
    }
    var kinesis = new AWS.Kinesis(kinesisInfo.config);
    var consumer = new KinesisConsumer(kinesis)
        .streamName(kinesisInfo.streamName)
        .shouldParseJson(false)
        .handler(data => {
            console.log("**** " + data);
        })
        .process()
        ;

});
