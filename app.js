const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const bridgeRouter = require('./src/api/uuid-bridge/bridge');
const verifyRouter = require('./src/api/verifier/verify');
const keyGenRouter = require('./src/api/key-generator/key-generator');
const ws = require('./src/api/uuid-bridge/ws-server');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', bridgeRouter);
app.use('/verify', verifyRouter);
app.use('/key-generator', keyGenRouter);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

ws.startWebsocketServer();
