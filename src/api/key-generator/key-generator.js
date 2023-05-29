const express = require('express');

const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const privateKeyPath = path.join(__dirname, '..', '..', '..', 'private.key');

router.post('/', (req, res) => {
  try {
    // get secret token from request
    const secretToken = req.body.token;
    // TODO request DB for valid tokens
    if (secretToken === 'secret-token') {
      // Load the private key from a file or another secure source
      const privateKey = fs.readFileSync(privateKeyPath);

      // Generate the public key from the private key
      console.log('Generating the public key from the private key');
      const publicKey = crypto.createPublicKey(privateKey);

      // Send the public key as a response
      res.json({ publicKey: publicKey.export({ type: 'spki', format: 'pem' }) });
    } else {
      res.status(403).json({ error: 'Invalid token' });
    }
  } catch (err) {
    console.error('Failed to load private key:', err);
    res.status(500).json({ error: 'Failed to load private key' });
  }
});

module.exports = router;
