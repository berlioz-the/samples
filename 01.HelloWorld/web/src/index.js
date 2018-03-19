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
const port = 3000
app.get('/', (request, response) => {

    var data = 'Hello from Berlioz Web Tier! \n<br />';
    data += 'Peers:' + JSON.stringify(currentPeers, null, 2) + '\n<br />';

    if (currentPeers && _.keys(currentPeers).length > 0)
    {
        var peer = currentPeers[_.keys(currentPeers)[0]][0];
        Request('http://' + peer.address + ':' + peer.hostPort, {json:false}, (err, res, body) => {
          if (err) {
              console.log(err);
              data += 'ERROR From App Tier:' + JSON.stringify(err, null, 2) + '\n<br />';
              response.send(data);
              return;
          }
          console.log(body.url);
          console.log(body.explanation);

          data += 'Result From App Tier:' + JSON.stringify(body, null, 2) + '\n<br />';
          response.send(data);
      });
  } else {
      data += 'No Peers Present \n<br />';
      response.send(data);
  }
})

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
})
