module.exports = function (getIdentity) {

  const messagePrefix = '\x18Bitcoin Signed Message:\n';

  const verify = require('bitcoinjs-message').verify;

  function checkAndMergeIdentities(identity, signedIdentity) {

    // If no signed identity, nothing to merge
    if (!signedIdentity)
      return {
        valid: true,
        identity: identity
      };

    // Convert signed identity from X500 DN to plain object
    signedIdentity = deserializeX500DN(signedIdentity);

    // Check that identities match
    if (signedIdentity.commonName !== identity.commonName
      || (signedIdentity.emailAddress && identity.emailAddress
        && signedIdentity.emailAddress !== identity.emailAddress)) {
      return {
        valid: false,
        reason: 'identity_mismatch'
      };
    }

    // Attributes of the signed identity prevail over those of the identity claimed by the server
    let mergedIdentity = Object.assign({}, identity, signedIdentity);

    // Return the merged identity
    return {
      valid: true,
      identity: mergedIdentity
    };
  }

  function deserializeX500DN(x500dn) {
    const identity = {};
    const attrs = x500dn.split(/(?<!\\),/);
    attrs.forEach((attr) => {
      let keyValue = attr.split('=');
      let key = keyValue[0];
      let value = keyValue[1].replace("\\=", "=").replace("\\\"", "\"").replace("\\,", ",").replace("\\;", ";");
      value.replace("\\+", "+");
      switch (key) {
        case 'CN':
          identity.commonName = value;
          break;
        case 'EMAILADDRESS':
          identity.emailAddress = value;
          break;
        case 'O':
          identity.organization = value;
          break;
        case 'OU':
          identity.organizationalUnit = value;
          break;
        case 'L':
          identity.locality = value;
          break;
        case 'C':
          identity.country = value;
          break;
      }
    });
    return identity;
  }

  function randomString(len) {
    let l = 0;
    const a = [];
    while (l++ < len) a.push(Math.floor(Math.random() * 0xff));
    return (new Buffer(a)).toString('hex');
  }

  function validateIdentity(identityUrl, pubKey, signedIdentity) {

    // Get the identity of the public key from the identity server (and make the server sign a challenge)
    const leftData = randomString(16);
    return getIdentity(identityUrl, pubKey, leftData)
      .then((identity) => {

        // If no signature is returned
        if (!identity.signature) {

          // An identity should be returned
          if (!identity.identity) {
            return {
              valid: false,
              reason: "'identity' should be provided'"
            };
          }

          // Check that the identities match and can be merged
          return checkAndMergeIdentities(identity.identity, signedIdentity);
        }

        // If a signature is returned
        else {

          // Check that the random data returned are prefixed by the identity URL (to avoid man in the middle attacks)
          if (!identity.rightData.startsWith(identityUrl)) {
            return {
              valid: false,
              reason: `'rightData' should start with '${ identityUrl }'`
            };
          }

          // Check that the signature is valid
          return validateSignature(leftData + identity.rightData, pubKey, identity.signature)
            .then((result) => {

              // The signature should be valid
              if (!result.valid) {
                return result;
              }

              // Check that the identities match and can be merged
              return checkAndMergeIdentities(identity.identity, signedIdentity);
            });
        }
      })
      .catch((error) => {
        return {
          valid: false,
          reason: error.message
        };
      });
  }

  function validateSignature(message, address, signature) {
    try {
      return Promise.resolve({ valid: verify(message, messagePrefix, address, signature) });
    }
    catch (error) {
      return Promise.resolve({ valid: false, reason: error.message });
    }
  }

  return { validateSignature, validateIdentity, deserializeX500DN };
};
