const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
// TODO: switch to https using SSL crt
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Map();

const startWebsocketServer = () => {
  wss.on('connection', (ws) => {
    ws.send('WebSocket connection initialized');

    // connection is up, let's add a simple simple event
    ws.on('message', (message) => {
      const metadata = { uuid: message.uuid, redirectUrl: message.redirectUrl };
      clients.set(ws, metadata);
      // log the received message and send it back to the client
      console.log('received: %s', message);
      ws.send(`Hello, you sent -> ${message}`);
    });
  });

  // start our server
  server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port ${server.address().port} :)`);
  });

  return wss;
};

const checkWebSocketUp = (_wss) => _wss.readyState === WebSocket.OPEN;

module.exports = { startWebsocketServer, checkWebSocketUp };
