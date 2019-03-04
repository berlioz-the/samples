const _ = require('lodash');
const Promise = require('the-promise');
const berlioz = require('berlioz-sdk');
const {Storage} = require('@google-cloud/storage');
const PubSub = require('@google-cloud/pubsub');
const filterous = require('filterous');

berlioz.addon(require('berlioz-gcp'));

var SubscriptionId = null;

berlioz.queue('jobs').monitorFirst(peer => {
    console.log('[Pub /Sub] Changed.');
    console.log(peer)
    if (peer) {
        var name = peer.name;
        name = name.replace('/topics/', '/subscriptions/');
        name = name + '-' + berlioz.identity;
        var msgRequest = {
            name: name,
            topic: peer.name
        }
        console.log('CREATING SUBSCRIPTION:');
        console.log(msgRequest);
        return berlioz.queue('jobs').client(PubSub, 'SubscriberClient').createSubscription(msgRequest)
            .then(result => {
                console.log('NEW SUBSCRIPTION RESULT:');
                console.log(result);
                SubscriptionId = result.name;
            })
            .catch(reason => {
                if(reason.code == 6) {
                    console.log('SUBSCRIPTION ALREADY PRESENT.');
                    SubscriptionId = name;
                } else {
                    console.log('ERROR CREATING SUBSCRIPTION:');
                    console.log(reason);
                    throw reason;
                }
            });
    } else {
        SubscriptionId = null;
    }
})

function processQueue()
{
    console.log('[processQueue] ...')
    return Promise.resolve()
        .then(() => {
            if (!SubscriptionId) {
                return Promise.timeout(5000); 
            } else {
                return processSubscription(SubscriptionId)
            }
        })
        .then(() => processQueue());
}

function processSubscription(id)
{
    console.log('[processSubscription] %s...', id)

    var pullRequest = {
        subscription: id,
        maxMessages: 5
    }
    return berlioz.queue('jobs').client(PubSub, 'SubscriberClient').pull(pullRequest)
        .then(responses => {
            console.log(responses);
            return Promise.serial(responses.receivedMessages, x => processMessage(x));
        })
        .catch(reason => {
            console.log('[processSubscription] Error: ');
            console.log(reason);
        })
}

function processMessage(message)
{
    console.log('[processMessage] ', message)
    var data = JSON.parse(message.message.data.toString());
    console.log('[processMessage] ', data)
    return downloadImage(data.name)
        .then(buf => {
            console.log('[processMessage] got buffer: %s', buf.length)
            return processImage(buf);
        })
        .catch(reason => {
            console.log('[processMessage] error in download: ')
            console.log(reason);
        })
}

function downloadImage(id)
{
    return new Promise((resolve, reject) => {
        berlioz.database('images').client(Storage).file('orig/' + id)
            .then(file => {
                return file.createReadStream();
            })
            .then(stream => {
                var bufs = [];
                stream.on('data', d => {
                    bufs.push(d);
                });
                stream.on('end', () => {
                    var buf = Buffer.concat(bufs);
                    resolve(buf)
                });
                stream.on('error', (error) => {
                    console.log(error);
                    reject(error);
                });
            })
            .catch(reason => {
                console.log(reason);
                reject(reason);
            });

    });
    
}

function processImage(buf)
{
    console.log('[processImage] buffer size: %s', buf.length);

    return filterous.importImage(buf, options)
        .applyInstaFilter('amaro')
        .save(filename);
}

return processQueue()
    .then(result => {
        console.log("FINISHED: " + result);
    })
    .catch(reason => {
        console.log("ERROR: ");
        console.log(reason);
    })