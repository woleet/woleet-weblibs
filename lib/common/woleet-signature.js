module.exports = function (getIdentity) {

  const messagePrefix = '\x18Bitcoin Signed Message:\n';

  const verify = require('bitcoinjs-message').verify;

  function checkIdentities(identity, signedIdentity) {

    // If no signed identity, simply return the identity claimed by the identity server
    if (!signedIdentity)
      return {
        valid: true,
        identity
      };

    // Convert signed identity from X500 DN to plain object
    signedIdentity = deserializeX500DN(signedIdentity);

    // Check that identities match
    if (signedIdentity.commonName !== identity.commonName
      || (signedIdentity.emailAddress && identity.emailAddress
        && signedIdentity.emailAddress !== identity.emailAddress)) {
      return {
        valid: false,
        reason: "identity_mismatch"
      };
    }

    // Return both identities
    return {
      valid: true,
      identity,
      signedIdentity
    };
  }

  /**
   * Build a JSON object from a X500 Distinguished Name.
   * See https://tools.ietf.org/html/rfc4514
   * @param x500dn X500 Distinguished Name
   */
  function deserializeX500DN(x500dn) {

    /**
     * Split a string using a specific character delimiter, but don't split if the delimiter is escaped.
     * This function is equivalent to .split(/(?<!\\){c}/) but this regex is not supported on FireFox or Safari.
     * @param delim character delimiter
     * @param str string to split
     */
    function splitUnescaped(delim, str) {
      let result = [];
      let previousChar;
      let start = 0;
      for (let i = 0; i < str.length; i++) {
        const currentChar = str.charAt(i);
        if (currentChar === delim && previousChar !== '\\') {
          result.push(str.slice(start, i));
          i++;
          start = i;
        }
        if (i >= str.length - 1) {
          result.push(str.slice(start, i + 1));
        }
        previousChar = currentChar;
      }
      return result;
    }

    const identity = {};
    const attrs = splitUnescaped(',', x500dn); // split at ',' but not at '\,'
    attrs.forEach((attr) => {
      const keyValue = splitUnescaped('=', attr); // split at '=' but not at '\='
      const key = keyValue[0];
      const value = keyValue[1]
        .replace("\\ ", " ")        // unescape whitespace
        .replace("\\=", "=")        // unescape =
        .replace("\\\"", "\"")      // unescape "
        .replace("\\,", ",")        // unescape ,
        .replace("\\;", ";")        // unescape ;
        .replace("\\+", "+");       // unescape +
      switch (key.toUpperCase().trim()) {
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

  function validateIdentity(identityUrl, pubKey, signedIdentity, signedIssuerDomain) {

    // If there is no identity server
    if (!identityUrl) {

      // If no identity is signed, identity is invalid
      if (!signedIdentity) {
        return Promise.resolve({
          valid: false,
        });
      }

      // If an identity is signed, this identity is valid
      return Promise.resolve({
        valid: true,
        signedIdentity: deserializeX500DN(signedIdentity)
      });
    }

    // Check that identity URL is part of signed issuer domain
    if (signedIssuerDomain && !new URL(identityUrl).hostname.includes(signedIssuerDomain)) {
      return Promise.resolve({
        valid: false,
        reason: "identity_mismatch"
      });
    }

    // Get the identity of the public key from the identity server
    // (and ask the server sign a challenge if we has the private key)
    const leftData = randomString(16);
    return getIdentity(identityUrl, pubKey, signedIdentity, leftData)
      .then((identity) => {

        // Check response
        if (!identity || typeof identity != 'object') {
          return {
            valid: false,
            reason: "invalid response"
          };
        }

        // If no signature is returned
        if (!identity.signature) {

          // An identity should be returned
          if (!identity.identity) {
            return {
              valid: false,
              reason: "'identity' should be provided'"
            };
          }

          // Check that the identities match
          return checkIdentities(identity.identity, signedIdentity);
        }

        // If a signature is returned
        else {

          // Check that the random data returned are prefixed by the identity URL (to avoid man in the middle attacks)
          if (!identity.rightData.startsWith(identityUrl)) {
            return {
              valid: false,
              reason: `'rightData' should start with '${identityUrl}'`
            };
          }

          // Check that the signature is valid
          return validateSignature(leftData + identity.rightData, pubKey, identity.signature)
            .then((result) => {

              // The signature should be valid
              if (!result.valid) {
                return result;
              }

              // Check that the identities match
              return checkIdentities(identity.identity, signedIdentity);
            });
        }
      })

      // If identity cannot be retrieved from server
      .catch((error) => {

        // If key is not found, identity is considered as invalid
        if (error.message === 'key_not_found') {
          return {
            valid: false,
            reason: error.message
          };
        }

        // If no identity is signed, identity is invalid
        if (!signedIdentity) {
          return Promise.resolve({
            valid: false,
            reason: error.message
          });
        }

        // If an identity is signed, this identity is valid
        return Promise.resolve({
          valid: true,
          signedIdentity: deserializeX500DN(signedIdentity)
        });
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
