const berlioz = require('berlioz-sdk');
berlioz.addon(require('berlioz-gcp'));
var mysql = require('promise-mysql');
var _ = require('lodash');
var Promise = require('promise');
var ejs = require('ejs');
var path = require('path');

exports.handler = (req, res) => {

    var renderData = {
        entries: []
    }

    return connectToDatabase()
    .then(connection => {
        return Promise.resolve()
        .then(() => {
            if (req.method == 'POST') {
                return processPost(connection, req, renderData);
            }
        })
        .then(() => processGet(connection, req, renderData))
        .catch(reason => {
            renderData.error = reason;
        })
        .then(() => renderResult(res, renderData));
    })
}

function processGet(connection, req, renderData)
{
    return connection.query(`SELECT * FROM contacts`)
        .then(result => {
            renderData.entries = result;
        })
};

function processPost(connection, req, renderData)
{
    return connection.query(`INSERT INTO contacts(name, phone) VALUES('${req.body.name}', '${req.body.phone}')`);
}

function renderResult(res, renderData)
{
    ejs.renderFile(
        path.join(__dirname, 'views', 'index.ejs'),
        renderData,
        (err, html) => {
            if (err) {
                res.send(err);
            } else {
                res.send(html);
            }
        });
}


var mysqlConfig = {
    config: null
};
berlioz.database('book').monitorFirst(peer => {
    if (peer) {
        mysqlConfig.config = _.clone(peer.config);
        mysqlConfig.config.user = 'root';
        mysqlConfig.config.password = '';
    } else {
        mysqlConfig.config = null;
    }
});

function connectToDatabase()
{
    if (!mysqlConfig.config) {
        throw new Error('Database Not Present.');
    }

    var config = _.clone(mysqlConfig.config);
    config.database = 'demo';

    return mysql.createConnection(config);
}
