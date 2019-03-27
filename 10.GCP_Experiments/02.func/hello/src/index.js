const berlioz = require('berlioz-sdk');
berlioz.addon(require('berlioz-gcp'));
var mysql = require('mysql');
var _ = require('lodash');

var mysqlConfig = {
    config: null
};

console.log("Module Begin X...");

berlioz.database('inventory').monitorFirst(peer => {
    if (peer) {
        console.log("[monitorFirst] Peer: ");
        console.log(JSON.stringify(peer, null, 4));
        mysqlConfig.config = _.clone(peer.config);
        mysqlConfig.config.user = 'root';
        mysqlConfig.config.password = '';
    } else {
        console.log("[monitorFirst] No Peer Found");
        mysqlConfig.config = null;
    }

    console.log("[monitorFirst] Final mysqlConfig: ");
    console.log(JSON.stringify(mysqlConfig, null, 4));

});

exports.handler = (req, res) => {

    console.log("Handler Begin...");
    console.log("[handler] mysqlConfig: ");
    console.log(JSON.stringify(mysqlConfig, null, 4));

    if (mysqlConfig.config) {
        console.log(JSON.stringify(mysqlConfig.config, null, 4));
    } else {
        console.log("Missing mysqlConfig");
    }

    connectToDemoDatabase(con => {
        if (!con) {
            res.send("Could not connect to demo database.");
            return;
        }

        con.query("SELECT * FROM demo.persons;"
            ,(err, result) => {
                console.log("QUERY RESULT.");
                console.log(err);
                console.log(result);

                if (err) {
                    console.log("*** ERROR ****");
                    console.log(err);
                    res.send(err.message + err.stack);
                    return;
                }

                res.send(JSON.stringify(result, null, 4));
        });

        // con.query(
        //     "USE demo; \n"
        //     + "CREATE TABLE IF NOT EXISTS persons ( \n"
        //     + "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, \n"
        //     + "name varchar(100) );"
        // ,(err, result) => {
        //     console.log("Table persons Created.");
        //     console.log(err);
        //     console.log(result);
        //
        //     if (err) {
        //         console.log("*** ERROR ****");
        //         console.log(err);
        //         res.send(err.message + err.stack);
        //         return;
        //     }
        //
        //     res.send("Table persons created.");
        // });
    });
};


function connectToDemoDatabase(cb)
{
    connectToDatabase('sys', conSys => {
        if (!conSys) {
            console.log("Could not connect to db: " + 'sys');
            cb(null);
            return;
        }

        conSys.query("CREATE DATABASE IF NOT EXISTS demo", (err, result) => {
            console.log("Created DB.");
            console.log(err);
            console.log(result);

            if (err) {
                console.log("*** ERROR ****");
                console.log(err);
                cb(null);
                return;
            }

            conSys.end();
            connectToDatabase('demo', cb);
        });
    })
}

function connectToDatabase(name, cb)
{
    if (!mysqlConfig.config) {
        console.log("*** ERROR: DB Peer not present");
        cb(null);
        return;
    }

    var config = _.clone(mysqlConfig.config);
    config.database = name;

    var con = mysql.createConnection(config);
    con.connect(err => {
        if (err) {
            console.log("*** ERROR ****");
            console.log("Could not connect to: " + name);
            console.log(err);
            cb(null);
        } else {
            cb(con);
        }
    })
}
