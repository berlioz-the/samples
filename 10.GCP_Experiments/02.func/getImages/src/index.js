const berlioz = require('berlioz-sdk');
berlioz.addon(require('berlioz-gcp'));

const {Storage} = require('@google-cloud/storage');

exports.handler = (req, res) => {

    berlioz.database('images').client(Storage).getFiles()
        .then(data => {

            var names = data.map(x => x.name);

            var result = `<html>
            <body>
            <pre><strong>
            ${JSON.stringify(names, null, 4)}
            </strong></pre>
            </body>
            </html>`

            res.send(result);
        });
};
