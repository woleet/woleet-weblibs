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
        if (!res.rightData || !res.signature)
          throw new Error('bad_server_response');

        // If server prepends rightData by an URL, it must match to identityUrl
        if ((/^https?\:\/\/.*/.test(res.rightData) || strict) && !res.rightData.startsWith(identityUrl)) {
          return Promise.resolve({valid: false, reason: `Server's "rightData" (${res.rightData}) was expected to start with ${identityUrl}`})
        }

        return validateSignature(rand + res.rightData, pubKey, res.signature)
      })
  }

  function validateSignature(message, address, signature) {
    return Promise.resolve((() => {
      try {
        return {valid: verify(message, messagePrefix, address, signature)};
      } catch (err) {
        return {
          valid: false,
          reason: err.message
        }
      }
    })())
  }

  return {validateSignature, validateIdentity};

};
