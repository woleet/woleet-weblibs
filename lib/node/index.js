if (typeof window !== 'undefined') {
  throw new Error('This module is not meant to be used by a browser');
}

const EventEmitter = require('events').EventEmitter;
const crypto = require('crypto');
const Readable = require('stream').Readable;

const getJSON = require('./get-json');

const woleet = require('../common/woleet-api')(getJSON);

// defining crypto
woleet.crypto = {
  createHash: crypto.createHash,
  sha224: () => crypto.createHash('sha224'),
  sha256: () => crypto.createHash('sha256'),
  sha384: () => crypto.createHash('sha384'),
  sha512: () => crypto.createHash('sha512'),
};

// defining receipt.validate (woleet-chainpoint)
require('../common/woleet-chainpoint')(woleet);

const validHashParameter = (file) => (file instanceof Readable) || Buffer.isBuffer(file);

/**
 * @extends EventEmitter
 * @constructor
 */
function Hasher() {

  const CANCEL_EXCEPTION = '__cancel__';
  const SKIP_EXCEPTION = '__skip__';
  const self = this;
  let cancel = null;
  let skip = null;
  let _ready = true;

  function handleCancel(err) {
    if (err !== CANCEL_EXCEPTION) throw err;
  }

  function handleSkip(err) {
    if (err !== SKIP_EXCEPTION) throw err;
  }

  /**
   * @param {stream.readable|Buffer} fileStream
   * @returns {Promise}
   */
  function hashFile(fileStream) {

    if (Buffer.isBuffer(fileStream)) {
      const result = crypto.createHash('sha256').update(fileStream).digest('hex');
      self.emit('start', {start: true, file: fileStream});
      self.emit('result', {result, file: fileStream});
      return Promise.resolve();
    }

    let hasher = crypto.createHash('sha256');

    self.emit('start', {start: true, file: fileStream});

    return new Promise((resolve, reject) => {
      let reader = fileStream;
      try {
        reader.on('data', (data) => {
          hasher.update(data);
          self.emit('progress', {progress: 0, file: fileStream})
        });
        reader.on('end', () => {
          const result = hasher.digest('hex');
          self.emit('result', {result, file: fileStream});
          resolve();
        });
        reader.on('error', (error) => {
          console.log(error.message, fileStream);
          self.emit('error', {error, file: fileStream});
          reject()
        });
      } catch (error) {
        console.log(error.message, fileStream);
        reject(error);
      }

      cancel = () => reader.destroy(CANCEL_EXCEPTION);
      skip = () => reader.destroy(SKIP_EXCEPTION);
    })
  }

  /**
   * @param {stream.readable[]} files
   * @returns {Promise.<string>}
   */
  const hashFiles = (files) => files.reduce((stack, file) => stack.then(hashFile).catch(handleSkip), Promise.resolve());

  /**
   * @param {stream.readable[]|stream.readable} files
   * @returns {*}
   */
  this.start = (files) => {
    _ready = false;
    let job;
    if (Array.isArray(files)) {
      if (!files.every(validHashParameter)) throw new Error("invalid_parameter");
      job = hashFiles(files);
    } else {
      if (!validHashParameter(files)) throw new Error("invalid_parameter");
      job = hashFile(files);
    }
    return job.catch(handleCancel).then(() => _ready = true)
  };

  this.cancel = () => cancel && cancel();

  this.skip = () => skip && skip();

  this.isReady = () => _ready;

}

Hasher.prototype.__proto__ = EventEmitter.prototype;

// defining hashfile
/**
 * @param {stream.readable[]|stream.readable|Buffer[]|Buffer|string} file
 * @param {Function} [progressCallback]
 * @returns {Promise<Hash>}
 */
function hashFileOrCheckHash(file, progressCallback) {
  return new Promise((resolve, reject) => {
    // If parameter is a file, hash it
    if (validHashParameter(file)) {
      const hasher = new Hasher;
      hasher.on('result', (message, file) => {
        resolve(message.result);
        if (progressCallback) progressCallback({progress: 1.0, file})
      });

      if (progressCallback) hasher.on('progress', progressCallback);

      hasher.on('error', reject);

      hasher.start(file)
    }

    // If parameter is a hash, check it is a valid SHA256 hash
    else if (typeof file === 'string') {
      if (woleet.isSHA256(file)) resolve(file);
      else reject(new Error("parameter_string_not_a_sha256_hash"));
    }

    // Invalid parameter
    else reject(new Error("invalid_parameter"));
  });
}

woleet.file = {Hasher, hashFileOrCheckHash};

// defining receipt.validate (woleet-chainpoint)
woleet.receipt.validate = require('../common/woleet-chainpoint')(woleet.crypto);

// defining signature (woleet-signature)
woleet.signature = require('../common/woleet-signature')(woleet.identity.getIdentity);

// defining verify (woleet-verify)
woleet.verify = require('../common/woleet-verify')(hashFileOrCheckHash);

/**
 * @type woleet
 */
module.exports = woleet;
