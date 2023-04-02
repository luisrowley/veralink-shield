const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const verifyRouter = require('./src/verifier/verify');

app.use(bodyParser.urlencoded({ extended: true }));

app.use('/verify', verifyRouter);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});