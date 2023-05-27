/**
 * This endpoint is meant to only receive
 * request from the authorized mobile app
 */

const express = require('express');
const crypto = require('crypto');
const request = require('request');
const fs = require('fs');
const isValidHttpUrl = require('../../utils/data-validators');

const router = express.Router();

const VERALINK_PRIVATE_KEY = fs.readFileSync('private.key');
const REMOTE_ENDPOINT_URI = '/veralink';

router.get('/', (req, res) => {
  const urlToVerify = req.query.url;
  const urlParams = new URL(urlToVerify);
  const host = `${urlParams.protocol}//${urlParams.host}`;
  const REMOTE_SDK_URL = host + REMOTE_ENDPOINT_URI;

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

  const signatureBase64 = signature.sign(VERALINK_PRIVATE_KEY, 'base64');

  // send verification to remote SDK

  request.post(REMOTE_SDK_URL, {
    form: {
      url: urlToVerify,
      signature: signatureBase64,
    },
  }, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      res.status(500).send('Failed to verify URL signature');
      return;
    }

    if (body !== 'OK') {
      res.status(500).send('Invalid signature');
      return;
    }

    res.redirect(urlToVerify);
  });
});

module.exports = router;
