if (typeof window === 'undefined') {
  throw new Error('This module is not meant to be used by node');
}

const getJSON = require('./get-json');

const woleet = require('../common/woleet-api')(getJSON);

// defining crypto
woleet.crypto = require('./woleet-crypto');

// defining file
woleet.file = require('./woleet-hashfile');

// defining receipt.validate (woleet-chainpoint)
woleet.receipt.validate = require('../common/woleet-chainpoint')(woleet.crypto);

// defining signature (woleet-signature)
woleet.signature = require('../common/woleet-signature')(woleet.identity.get);

// defining verify (woleet-verify)
woleet.verify = require('../common/woleet-verify')(woleet);

module.exports = woleet;
