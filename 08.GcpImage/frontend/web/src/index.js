const _ = require('lodash');
const Promise = require('the-promise');
const fs = require('fs');
const express = require('express');
const berlioz = require('berlioz-sdk');
const {Storage} = require('@google-cloud/storage');
const PubSub = require('@google-cloud/pubsub');
const formidable = require('formidable');
const uuid = require('uuid/v4');

const app = express();
berlioz.setupExpress(app);
berlioz.addon(require('berlioz-gcp'));

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', function (req, response) {
    var renderData = {
        images: []
    };

    return queryImages()
        .then(names => {
            return Promise.serial(names, name => {
                var imageInfo = {
                    name: name,
                    origUrl: '/image/' + name
                };
                return checkImageProcessed(name)
                    .then(isProcessed => {
                        if (isProcessed) {
                            imageInfo.processedUrl = '/procimage/' + name;
                        }
                    })
                    .then(() => {
                        renderData.images.push(imageInfo);
                    });
            })
        })
        .catch(reason => {
            renderData.error = reason.message;
        })
        .then(() => response.render('pages/index', renderData));
})

app.get('/image/:id', function (req, response) {
    downloadImage('orig', req, response);
})

app.get('/procimage/:id', function (req, response) {
    downloadImage('processed', req, response);
})

function queryImages()
{
    return berlioz.database('images').client(Storage).getFiles({ prefix: 'orig/'})
        .then(files => {
            return files.map(file => {
                var parts = file.name.split('/');
                var name = _.last(parts);
                if (!name) {
                    return null;
                }
                return name;
            })
        })
        .then(names => names.filter(x => x));
}

function checkImageProcessed(name)
{
    return berlioz.database('images').client(Storage).file('processed/' + name)
        .then(file => file.exists())
        .then(result => {
            if (result[0]) {
                return true;
            }
            return false;
        })
}

function downloadImage(kind, req, response)
{
    return berlioz.database('images').client(Storage).file(kind + '/' + req.params.id)
        .then(file => {
            return file.createReadStream();
        })
        .then(stream => {
            stream.on('end', () => {
                response.end();
            });
            stream.on('error', (error) => {
                console.log(error);
                response.end();
            });
            stream.pipe(response);
        })
        .catch(reason => {
            console.log(reason);
            response.send("error: " + reason.message);
        });
}

app.post('/upload', (req, res) => {
    var files = [];
    new formidable.IncomingForm().parse(req)
        .on('file', (name, file) => {
            files.push(file);
        })
        .on('aborted', () => {
            console.error('Request aborted by the user')
        })
        .on('error', (err) => {
            console.error('Error', err)
        })
        .on('end', () => {
            var name = uuid();
            return Promise.serial(files, file => {
                var stream = fs.createReadStream(file.path);
                return uploadImage('orig', name, stream);
            })
            .then(() => {
                return publishJob({ name: name });
            })
            .then(() => {
                res.redirect('/');
            })
            .catch(reason => {
                console.log(reason);
                res.write('Error: ' + reason.message);
                res.end()
            })
        })
});

function uploadImage(kind, name, stream)
{
    return new Promise((resolve, reject) => {
        berlioz.database('images').client(Storage).file(kind + '/' + name)
            .then(file => {
                return file.createWriteStream();
            })
            .then(writeStream => {
                stream.pipe(writeStream)
                    .on('error', (error) => {
                        reject(error);
                    })
                    .on('finish', () => {
                        resolve();
                    });
            })
            .catch(reason => {
                reject(reason);
            });
    });
}

function publishJob(msg)
{
    const msgRequest = {
        messages: [
            {
                data: Buffer.from(JSON.stringify(msg))
            }
        ],
    };
    return berlioz.queue('jobs').client(PubSub, 'PublisherClient')
        .publish(msgRequest);
}

app.listen(process.env.BERLIOZ_LISTEN_PORT_DEFAULT,
           process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_DEFAULT}`)
})
