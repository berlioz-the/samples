const berlioz = require('berlioz-sdk');
berlioz.addon(require('berlioz-gcp'));
var mysql = require('promise-mysql');
var _ = require('lodash');
var Promise = require('promise');
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

exports.handler = (event, callback) => {
    const pubsubMessage = event.data;
    const strData = Buffer.from(pubsubMessage.data, 'base64').toString();
    console.log(`Message: ${strData}`);
    var body = JSON.parse(strData);

    const number = phoneUtil.parseAndKeepRawInput(body.phone, 'US');
    var newPhone = phoneUtil.format(number, PNF.INTERNATIONAL);

    console.log(`Connecting to database...`);
    return connectToDatabase()
        .then(connection => {
            console.log(`Updating...`);
            return connection.query(`UPDATE contacts SET phone='${newPhone}' WHERE name = '${body.name}'`)
        })
        .then(() => {
            console.log(`Done.`);
            callback();
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
        mysqlConfig.config.database = 'demo';
    } else {
        mysqlConfig.config = null;
    }
});
function connectToDatabase()
{
    if (!mysqlConfig.config) {
        throw new Error('Database Not Present.');
    }
    return mysql.createConnection(mysqlConfig.config);
}
