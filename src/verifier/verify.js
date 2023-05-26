const express = require('express');
const crypto = require('crypto');
const request = require('request');
const fs = require('fs');
const isValidHttpUrl = require('../utils/data-validators');

const router = express.Router();

const VERALINK_PRIVATE_KEY = fs.readFileSync('private.key');
const REMOTE_ENDPOINT_URI = '/veralink';

router.get('/', (req, res) => {
  const urlToVerify = req.query.url;
  const mobileReq = req.query.mobile;
  const urlParams = new URL(urlToVerify);
  const host = `${urlParams.protocol}//${urlParams.host}`;
  const REMOTE_SDK_URL = host + REMOTE_ENDPOINT_URI;
  console.log(`host: ${host}`, `mobile: ${mobileReq}`);

  if (!urlToVerify) {
    res.status(400).send('(404) Bad Request: missing url parameter.');
    return;
  }
  // check remote host url
  if (!isValidHttpUrl(host)) {
    res.status(400).send('(404) Bad Request: unable to resolve remote host.');
    return;
  }

  const signature = crypto.createSign('RSA-SHA256');
  signature.write(urlToVerify);
  signature.end();

  // console.log(urlToVerify, REMOTE_SDK_URL);

  const signatureBase64 = signature.sign(VERALINK_PRIVATE_KEY, 'base64');

  // send verification to remote SDK
  if (mobileReq) {
    // if request contains channelID, send validate req to SDK
    // validate OK? -> resolve matching channelID and redirect

    request.post(REMOTE_SDK_URL, {
      form: {
        url: urlToVerify,
        signature: signatureBase64,
      },
    }, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        console.log(`Failed to verify URL signature${error}`, signature);
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
  } else {
    // generate page with QR code <url + channelID>
    // connect to messaging channel and wait for message from mobile app
  }
});

module.exports = router;
