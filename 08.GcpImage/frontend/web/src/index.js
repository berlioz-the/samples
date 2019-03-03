const _ = require('lodash');
const Promise = require('the-promise');
const express = require('express');
const berlioz = require('berlioz-sdk');
const {Storage} = require('@google-cloud/storage');
const formidable = require('formidable');

const app = express();
berlioz.setupExpress(app);
berlioz.addon(require('berlioz-gcp'));

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', function (req, response) {
    var renderData = {
        images: []
    };

    return Promise.resolve()
        .then(() => berlioz.database('images').client(Storage).getFiles({ prefix: 'orig/'}))
        .then(result => {
            for(var file of result)
            {
                var parts = file.name.split('/');
                var name = _.last(parts);
                if (!name) {
                    continue;
                }
                renderData.images.push({
                    name: name,
                    origUrl: '/image/' + name,
                    processedUrl: '/image/' + name
                });
            }
        })
        .catch(reason => {
            renderData.settings.push({
                name: 'ERROR:: ',
                value: reason.message
            })
        })
        .then(() => response.render('pages/index', renderData));
})

app.get('/image/:id', function (req, response) {
    console.log('***********************');
    console.log('Param: ' + req.params.id);
    return berlioz.database('images').client(Storage).file('orig/' + req.params.id)
        .then(file => {
            console.log('--------------------');
            console.log(file);
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
})

app.post('/upload', (req, res) => {
    var files = [];
    new formidable.IncomingForm().parse(req)
        .on('file', (name, file) => {
            files.push(file);
            console.log(file);
        })
        .on('aborted', () => {
            console.error('Request aborted by the user')
        })
        .on('error', (err) => {
            console.error('Error', err)
        })
        .on('end', () => {
            return Promise.serial(files, file => {
                res.write(`X File: ${file.name}, size: ${file.size}<br/>`);
            })
            .then(() => {
                res.end()
            })
            .catch(reason => {
                res.write('Error: ' + reason.message);
                res.end()
            })
        })
})


for(var x of _.keys(process.env)) {
    console.log('ENV:: ' + x + ' => ' + process.env[x]);
}

app.listen(process.env.BERLIOZ_LISTEN_PORT_DEFAULT,
           process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_DEFAULT}`)
})
