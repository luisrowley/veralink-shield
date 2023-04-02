const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const request = require('request');
const fs = require('fs');

const VERALINK_PRIVATE_KEY = fs.readFileSync('private.key');
const REMOTE_ENDPOINT_URL = '<remote-endpoint-url>';

router.get('/', (req, res) => {
  const urlToVerify = req.query.url;
  const signature = crypto.createSign('RSA-SHA256');
  signature.write(urlToVerify);
  signature.end();

  console.log(urlToVerify);

  const signatureBase64 = signature.sign(VERALINK_PRIVATE_KEY, 'base64');

  request.post(REMOTE_ENDPOINT_URL, {
    form: {
      url: urlToVerify,
      signature: signatureBase64
    }
  }, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      console.log('Failed to verify URL signature');
      res.status(500).send('Failed to verify URL signature');
      return;
    }

    if (body !== 'OK') {
      console.log('Invalid signature');
      res.status(500).send('Invalid signature');
      return;
    }

    console.log(`URL redirect: ${urlToVerify}`);
    res.redirect(urlToVerify);
  });
});

module.exports = router;
