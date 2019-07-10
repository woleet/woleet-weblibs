module.exports = function (getIdentity) {

  const messagePrefix = '\x18Bitcoin Signed Message:\n';

  const verify = require('bitcoinjs-message').verify;

  function randomString(len) {
    let l = 0;
    const a = [];
    while (l++ < len) a.push(Math.floor(Math.random() * 0xff));
    return (new Buffer(a)).toString('hex')
  }

  function validateIdentity(identityUrl, pubKey) {

    // Get the identity of the public key from the identity server (and make the server sign a challenge)
    const leftData = randomString(16);
    return getIdentity(identityUrl, pubKey, leftData)
      .then((res) => {

        // If no signature is returned
        if (!res.signature) {

          // Check that an identity is returned
          if (!res.identity) {
            return Promise.resolve({
              valid: false,
              reason: "'identity' should be provided'"
            });
          }

          // Return the identity claimed by the server
          return Promise.resolve({
            valid: true,
            identity: res.identity
          });
        }

        // If a signature is returned
        else {

          // Check that the random data returned are prefixed by the identity URL (to avoid man in the middle attacks)
          if (!res.rightData.startsWith(identityUrl)) {
            return Promise.resolve({
              valid: false,
              reason: `'rightData' should start with '${ identityUrl }'`
            })
          }

          // Check that the signature is valid
          return validateSignature(leftData + res.rightData, pubKey, res.signature)
            .then((validationObject) => {

              // Return the identity claimed by the server
              validationObject.identity = res.identity;
              return validationObject;
            });
        }
      })
      .catch((error) => {
        return Promise.resolve({
          valid: false,
          reason: error.message
        });
      });
  }

  function validateSignature(message, address, signature) {
    return Promise.resolve((() => {
      try {
        return { valid: verify(message, messagePrefix, address, signature) };
      }
      catch (error) {
        return {
          valid: false,
          reason: error.message
        }
      }
    })())
  }

  return { validateSignature, validateIdentity };
};
