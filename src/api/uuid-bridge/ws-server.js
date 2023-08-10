const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
let wss;
let server;

if (process.env.PROXY_SCHEMA === 'https') {
// Load SSL/TLS certificate and key files
  const serverConfig = {
    cert: fs.readFileSync(process.env.SSL_CERTIFICATE_FILE),
    key: fs.readFileSync(process.env.SSL_CERTIFICATE_KEY_FILE),
  };
  server = https.createServer(serverConfig, app);
  wss = new WebSocket.Server({ server });
} else {
  server = http.createServer(app);
  wss = new WebSocket.Server({ server });
}

const clients = new Map();
const clientsByUid = {};

const startWebsocketServer = () => {
  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ msg: 'WebSocket connection initialized' }));

    // connection up
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

        if (userWsConnection) {
          const storedMetadata = clients.get(userWsConnection);

          if (storedMetadata && storedMetadata.redirectUrl) {
            // if redirect URL for UID, tell CLIENT
            userWsConnection.send(JSON.stringify({
              redirectUrl: storedMetadata.redirectUrl,
              uid: decodedMsg.uid,
            }));
          }
        } else {
          ws.send(JSON.stringify({
            error: 'Error: no active connection for UID',
            uid: decodedMsg.uid,
          }));
        }
      }
      // log the received message and send it back to the client
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
