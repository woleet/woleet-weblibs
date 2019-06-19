module.exports = function (getRandomSignature) {

  const messagePrefix = '\x18Bitcoin Signed Message:\n';

  const verify = require('bitcoinjs-message').verify;

  function randomString(len) {
    let l = 0;
    const a = [];
    while (l++ < len) a.push(Math.floor(Math.random() * 0xff));
    return (new Buffer(a)).toString('hex')
  }

  function validateIdentity(identityUrl, pubKey, strict = false) {
    const rand = randomString(16);
    return getRandomSignature(identityUrl, pubKey, rand)
      .then((res) => {
        // If no signature is returned, we simply return the identity claimed by the server
        if (!res.signature) {
          return Promise.resolve({
            valid: true,
            identity: res.identity
          });
        }

        // The server SHOULD prefix his random data by his identity URL to avoid man in the middle attacks
        if ((/^https?\:\/\/.*/.test(res.rightData) || strict) && !res.rightData.startsWith(identityUrl)) {
          return Promise.resolve({
            valid: false,
            reason: `Server's "rightData" (${ res.rightData }) was expected to start with ${ identityUrl }`
          })
        }

        // If a signature is returned, we must verify it to ensure the ownership of the private key by the server
        return validateSignature(rand + res.rightData, pubKey, res.signature)
          .then((validationObject) => {
            validationObject.identity = res.identity;
            return validationObject;
          });
      })
  }

  function validateSignature(message, address, signature) {
    return Promise.resolve((() => {
      try {
        return { valid: verify(message, messagePrefix, address, signature) };
      } catch (err) {
        return {
          valid: false,
          reason: err.message
        }
      }
    })())
  }

  return { validateSignature, validateIdentity };
};
