const Promise = require('the-promise');
const AWS = require('aws-sdk');
const KinesisConsumer = require('aws-processors/kinesis-consumer');
const asciiArt = require('ascii-art')

const berlioz = require('berlioz-connector');

berlioz.queue('jobs').monitorFirst(kinesisInfo => {
    if (!kinesisInfo) {
        tracer.error('Queue Not Present');
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
    berlioz.zipkin.tracer.scoped(() => {
        berlioz.zipkin.tracer.createRootId();

        console.log('Processing: ' + JSON.stringify(data));
        var docClient = berlioz.database('arts').client(AWS);
        if (!docClient) {
            console.log('Error: DynamoDB not present.');
            return;
        }

        return renderText(data.name)
            .then(rendered => {
                var params = {
                    Item: {
                        'name': data.name,
                        'art': rendered
                    }
                };
                return docClient.put(params);
            });

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
