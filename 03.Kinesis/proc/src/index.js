const _ = require('the-lodash');
const Promise = require('the-promise');
const AWS = require('aws-sdk');
const KinesisConsumer = require('aws-processors/kinesis-consumer');
const asciiArt = require('ascii-art')

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
    var dynamoInfo = berlioz.getDatabaseInfo('arts');
    if (!dynamoInfo) {
        console.log('Error: DynamoDB not present.');
        return;
    }

    var docClient = new AWS.DynamoDB.DocumentClient(dynamoInfo.config);
    return renderText(data.name)
        .then(rendered => {
            var params = {
                TableName: dynamoInfo.tableName,
                Item: {
                    'name': data.name,
                    'art': rendered
                }
            };
            return docClient.put(params).promise();
        });
}

function renderText(text)
{
    return new Promise((resolve, reject) => {
        asciiArt.font(text, 'Doom', (rendered) => {
            resolve(rendered);
        });
    });
}
