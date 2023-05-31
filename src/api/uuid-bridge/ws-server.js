const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
// TODO: switch to https using SSL crt
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Map();
const clientsByUid = {};

const startWebsocketServer = () => {
  wss.on('connection', (ws) => {
    ws.send('WebSocket connection initialized');

    // connection is up, let's add a simple simple event
    ws.on('message', (message) => {
      const decodedMsg = JSON.parse(message);

      if (decodedMsg.create) {
        // WRITE OPERATION: request comes from bridge
        const incomingMetadata = { uid: decodedMsg.uid, redirectUrl: decodedMsg.url };
        clients.set(ws, incomingMetadata);
        clientsByUid[decodedMsg.uid] = ws;
      } else {
        // READ OPERATION: req comes from scanner app
        const userWsConnection = clientsByUid[decodedMsg.uid];
        const storedMetadata = clients.get(userWsConnection);

        if (storedMetadata && storedMetadata.redirectUrl) {
          // if redirect URL for UID, tell CLIENT
          // console.log('redirect URL: %s', storedMetadata.redirectUrl);
          userWsConnection.send(JSON.stringify({
            redirectUrl: storedMetadata.redirectUrl,
            uid: decodedMsg.uid,
          }));
        } else {
          // UIDs not matching, send error to CLIENT
          // console.log('redirect error:');
          userWsConnection.send(JSON.stringify({ error: 'redirect error' }));
        }
      }
      // log the received message and send it back to the client
      // console.log('received: %s', decodedMsg.uid);
      ws.send(JSON.stringify({ msg: `Server:: received message -> ${message}` }));
    });
  });

  // start our server
  server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port ${server.address().port} :)`);
  });

  return wss;
};

const checkWebSocketUp = (_wss) => _wss.readyState === WebSocket.OPEN;

module.exports = { startWebsocketServer, checkWebSocketUp, wss };
