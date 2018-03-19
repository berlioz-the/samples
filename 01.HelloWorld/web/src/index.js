const express = require('express')
const _ = require('lodash')
const Request = require('request')

var currentPeers = null;

const berlioz = require('berlioz-connector');

berlioz.monitorPeers('hello_world', 'app', 'client', peers => {
    console.log('PEERS:');
    console.log(JSON.stringify(peers, null, 2));
    // processPeers(peers);
    currentPeers = peers;
});

const app = express()

app.get('/', (request, response) => {

    var data = 'Hello from Berlioz Web Tier! \n<br />';
    data += 'Peers: <strong>' + JSON.stringify(currentPeers, null, 2) + '</strong>\n<br />';

    if (currentPeers && _.keys(currentPeers).length > 0)
    {
        var peer = currentPeers[_.keys(currentPeers)[0]][0];
        Request('http://' + peer.address + ':' + peer.hostPort, {json:false}, (err, res, body) => {
          if (err) {
              console.log(err);
              data += 'ERROR From App Tier:<strong>' + JSON.stringify(err, null, 2) + '</strong>\n<br />';
              response.send(data);
              return;
          }

          data += 'Result From App Tier:<strong>' + JSON.stringify(body, null, 2) + '</strong>\n<br />';
          response.send(data);
      });
  } else {
      data += 'No Peers Present \n<br />';
      response.send(data);
  }
})

app.listen(process.env.BERLIOZ_LISTEN_PORT_CLIENT, process.env.BERLIOZ_LISTEN_ADDRESS, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${process.env.BERLIOZ_LISTEN_ADDRESS}:${process.env.BERLIOZ_LISTEN_PORT_CLIENT}`)
})
