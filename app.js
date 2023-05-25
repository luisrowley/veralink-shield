const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const verifyRouter = require('./src/verifier/verify');
const keyGenRouter = require('./src/key-generator/key-generator');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use('/verify', verifyRouter);
app.use('/key-generator', keyGenRouter);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
