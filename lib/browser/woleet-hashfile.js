/**
 * @typedef {Object}   ProgressMessage
 * @typedef {Number}   ProgressMessage.progress (float number)
 * @typedef {File}     ProgressMessage.file
 */

/**
 * @typedef {Object}   StartMessage
 * @typedef {Boolean}  StartMessage.start always true
 * @typedef {File}     ProgressMessage.file
 */

/**
 * @typedef {Object}   ErrorMessage
 * @typedef {Error}    ErrorMessage.error
 * @typedef {File}     EndMessage.file
 */

/**
 * @typedef {Object}   EndMessage
 * @typedef {String}   EndMessage.end hash of the file
 * @typedef {File}     EndMessage.file
 */

if (typeof window === 'undefined') {
  throw new Error('This module is not meant to be used by node')
}

/**
 * @param {Hash} hash
 * @returns {boolean}
 */
const isSHA256 = (hash) => /^[a-f0-9]{64}$/i.test(hash);
const crypto = require('./woleet-crypto');
const root = window;

const isHTTPS = location.protocol === 'https:';

//noinspection JSUnresolvedVariable
const testNativeCryptoSupport = root.crypto && root.crypto.subtle && root.crypto.subtle.digest && isHTTPS;

/**
 * @returns {String} get the base path (including final '/') of the current script.
 */
function findBasePath() {
  let scripts = document.getElementsByTagName('script');
  let scriptsArray = Array.prototype.slice.call(scripts, 0); // Converts collection to array
  let regex = /.*woleet-(hashfile|weblibs)[.min]*\.js$/;
  let script = scriptsArray.find((script) => script.src && script.src.match(regex));
  return script && script.src ? script.src.substr(0, script.src.lastIndexOf("/") + 1) : null;
}

// Guess the path of the worker script: same as current script's or defined by woleet.workerScriptPath
let basePath = findBasePath();
let DEFAULT_WORKER_SCRIPT = "woleet-hashfile-worker.min.js";
//noinspection JSUnresolvedVariable
let workerScriptPath = root.woleet && root.woleet.workerScriptPath ? root.woleet.workerScriptPath : (basePath ? basePath + DEFAULT_WORKER_SCRIPT : null);
if (!workerScriptPath)
  console.error('Cannot find ' + DEFAULT_WORKER_SCRIPT);

function isFileReachable(url) {
  const req = new XMLHttpRequest();
  return new Promise((resolve) => {
    req.onload = () => resolve(req.status === 200);
    req.onerror = () => resolve(false);
    req.open("GET", url, true);
    req.send();
  }).catch(() => false);
}

/**
 * @type {Promise.<boolean>}
 */
const isWorkerSupportedPromise = (/**
   * Check support for workers.
   * @returns {Promise.<boolean>}
   */function checkFileReaderSyncSupport() {

    if (!workerScriptPath)
      return Promise.resolve(false);

    const workerReachablePromise = isFileReachable(workerScriptPath);

    const cryptoReachablePromise = isFileReachable(workerScriptPath.split('/').slice(0, -1).join('/') + '/woleet-crypto.min.js');

    function makeWorker(script) {
      //noinspection JSUnresolvedVariable
      let URL = root.URL || window.webkitURL;
      let Blob = root.Blob;
      let Worker = root.Worker;

      if (!URL || !Blob || !Worker || !script) return null;

      let blob = new Blob([script]);
      //noinspection JSUnresolvedFunction
      return new Worker(URL.createObjectURL(blob));
    }

    const workerSupportedPromise = new Promise(function (resolve) {
      let syncDetectionScript = "onmessage = function(e) { postMessage(!!FileReaderSync); close() };";
      try {
        let worker = makeWorker(syncDetectionScript);
        if (worker) {
          worker.onmessage = function (e) {
            worker.terminate();
            worker = null;
            resolve(e.data);
          };
          worker.postMessage({});
        }
        else resolve(false);
      } catch (err) {
        resolve(false);
      }
    });

    return Promise.all([workerReachablePromise, cryptoReachablePromise, workerSupportedPromise])
      .then((arr) => arr.every((e) => true === e))

  })().then((support) => {
    if (!support)
      console.warn('Failed to load worker.');
    return support;
  });


/**
 * @constructor
 */
function Hasher() {
  let ready = true;
  let cancel = null;
  let skip = null;

  let _events = {};
  const [EVT_START, EVT_PROGRESS, EVT_ERROR, EVT_RESULT, EVT_CANCEL, EVT_SKIP] = ['start', 'progress', 'error', 'result', 'cancel', 'skip'];

  const emit = (event, data) => _events[event] && _events[event](data);
  const emittable = (event) => _events[event];

  const _onCancel = (cb) => cancel = cb;
  const _onSkip = (cb) => skip = cb;

  const CANCEL_EXCEPTION = '__cancel__';
  const SKIP_EXCEPTION = '__skip__';

  const HASH_LOCAL_LIMIT = 5e7; // ~50MB
  const HASH_NATIVE_LIMIT = 5e8; // ~500MB

  /**
   * @constructor
   */
  function HashWorker() {

    let worker = new Worker(workerScriptPath);

    /**
     * @param {File} file
     * @returns {Promise}
     */
    this.hash = function (file) {
      return new Promise((next, reject) => {

        let cancelled = false;
        let skipped = false;

        const reader = new FileReader();

        _onCancel(() => {
          cancelled = true;
          worker.terminate();
          reader.abort();
          worker = null;
          emit(EVT_CANCEL, {file});
          reject(CANCEL_EXCEPTION);
        });

        _onSkip(() => {
          skipped = true;
          reader.abort();
          worker.postMessage({action: 'reset'});
        });

        const min = (a, b) => a > b ? b : a;
        const bufferSize = 0xfffff, fileSize = file.size;
        let start = 0, stop = 0;

        worker.onmessage = (event) => {
          if (cancelled) {
            return;
          }
          else if (event.data.reset) {
            emit(EVT_SKIP, {file});
            reject(SKIP_EXCEPTION);
            return;
          }
          else if (skipped) {
            return;
          }
          else if (event.data.result) {
            emit(EVT_RESULT, {result: event.data.result, file});
            return next();
          }
          else if (event.data.error) {
            let message = event.data.error;
            reader.abort();
            if (emittable(EVT_ERROR)) emit(EVT_ERROR, {error: new Error(message), file});
            else return reject(new Error(message));
          }
          else if (event.data.start) {
            emit(EVT_START, {start: event.data.start, file});
          }
          else if (event.data.progress) {
            emit(EVT_PROGRESS, {progress: stop / fileSize, file});
          } else {
            console.trace("Unexpected worker message: ", event);
          }

          if (stop !== fileSize) {
            start = stop;
            stop = min(stop + bufferSize, fileSize);
            reader.readAsArrayBuffer(file.slice(start, stop));
          } else {
            worker.postMessage({action: 'finalize'})
          }
        };

        reader.onload = (event) => {
          worker.postMessage({
            chunk: event.target.result,
            action: 'update'
          });
        };

        worker.postMessage({action: 'start'})
      });
    };

    /**
     * @type {Worker}
     */
    this.worker = worker;
  }

  /**
   * @param {File} file
   * @param {number} limit
   * @param {function} reject
   * @return {boolean} true if valid
   */
  function checkFileSize(file, limit, reject) {
    let error = new Error("file_too_big_to_be_hashed_without_worker");
    if (file.size > limit) {
      ready = true;
      if (emittable(EVT_ERROR)) return emit(EVT_ERROR, {error, file});
      else reject(error);
      return false;
    }
    return true;
  }

  /**
   * @param {File} file
   * @returns {Promise}
   */
  function hashLocal(file) {

    return new Promise((next, reject) => {

      if (!checkFileSize(file, HASH_LOCAL_LIMIT, reject))
        return;

      let prev = 0;
      let cancelled = false;
      let skipped = false;
      let report_update = false;
      const sha256 = crypto.sha256();
      const reader = new FileReader();

      /**
       * @param {ArrayBuffer} buffer
       * @param {Number} loaded
       */
      function update(buffer, loaded) {
        const blob = buffer.slice(prev, loaded);
        const chunkUint8 = new Uint8Array(blob);
        sha256.update(chunkUint8);
        prev = loaded;
      }

      _onCancel(() => {
        cancelled = true;
        reader.abort();
        emit(EVT_CANCEL, {file})
      });

      _onSkip(() => {
        skipped = true;
        reader.abort();
        emit(EVT_SKIP, {file})
      });

      reader.onloadstart = () => {
        if (cancelled || skipped) return;
        emit(EVT_START, {start: true, file});
      };

      reader.onload = (event) => {
        if (cancelled || skipped) return;

        if (report_update) {
          //noinspection JSCheckFunctionSignatures,JSUnresolvedVariable
          update(event.target.result, event.loaded, event.total);
        }

        const result = sha256.digest('hex');

        emit(EVT_RESULT, {result, file});

        next();
      };

      reader.onprogress = (event) => {
        if (cancelled || skipped) return;
        let data = event.target.result;

        emit(EVT_PROGRESS, {progress: event.loaded / event.total, file});

        //noinspection JSUnresolvedVariable
        if (!data)
          return report_update = true;
        //noinspection JSCheckFunctionSignatures,JSUnresolvedVariable
        update(data, event.loaded, event.total);

      };

      reader.onabort = () => {
        if (cancelled) {
          reject(CANCEL_EXCEPTION);
        } else if (skipped) {
          reject(SKIP_EXCEPTION);
        } else {
          reject(new Error('Unhandled abort exception'));
        }
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * @param {File} file
   * @returns {Promise}
   */
  function hashLocalWithNativeAPI(file) {

    return new Promise((resolve, reject) => {

      if (!checkFileSize(file, HASH_NATIVE_LIMIT, reject))
        return;

      const alg = "SHA-256";
      let cancelled = false;
      let skipped = false;
      // entry point
      const reader = new FileReader();

      _onCancel(() => {
        cancelled = true;
        reader.abort();
        emit(EVT_CANCEL, {file})
      });

      _onSkip(() => {
        skipped = true;
        reader.abort();
        emit(EVT_SKIP, {file})
      });

      reader.onloadstart = () => {
        if (cancelled || skipped) return;
        emit(EVT_START, {start: true, file});
      };

      reader.onprogress = (event) => {
        if (cancelled || skipped) return;
        emit(EVT_PROGRESS, {progress: event.loaded / event.total, file});
      };

      reader.onload = function (event) {
        if (cancelled || skipped) return;
        let data = event.target.result;

        //noinspection JSUnresolvedFunction,JSUnresolvedVariable
        root.crypto.subtle.digest(alg, data)
          .then((hash) => {
            if (cancelled || skipped) return;
            let hashResult = new Uint8Array(hash);
            let result = hashResult.reduce((res, e) => res + ('00' + e.toString(16)).slice(-2), '');
            emit(EVT_RESULT, {result, file});
            resolve();
          })
          .catch((error) => _events[EVT_ERROR] ? emit(EVT_ERROR, {error, file}) : reject(error));
      };

      reader.onabort = () => {
        if (cancelled) {
          reject(CANCEL_EXCEPTION);
        } else if (skipped) {
          reject(SKIP_EXCEPTION);
        } else {
          reject(new Error('Unhandled abort exception'));
        }
      };

      reader.readAsArrayBuffer(file);
    })
  }

  this.on = function (event, callback) {
    switch (event) {
      case EVT_START:
      case EVT_PROGRESS:
      case EVT_ERROR:
      case EVT_RESULT:
      case EVT_SKIP:
      case EVT_CANCEL:
        _events[event] = callback;
        break;
      default:
        throw new Error('Invalid event name "' + event + '"');
    }
  };

  this.start = function (files) {

    let hashWorker = null; // We may have to keep the hashWorker

    if (!ready) throw new Error("not_ready");

    ready = false;

    // Check input type
    if (!(files instanceof FileList || files instanceof File || (Array.isArray(files) && files.every((file) => file instanceof File))))
      throw new Error("invalid_parameter");

    isWorkerSupportedPromise
      .then((WorkerSupported) => {

        /**
         * Iterator function with selected hash method
         * @param {Number} i current index of the list
         * @param {Number} len total size of the list
         * @param {FileList|[File]} files file list
         */
        function iter(i, len, files) {

          if ((i >= len)) {
            ready = true;
            if (hashWorker && hashWorker.worker) {
              hashWorker.worker.terminate();
              hashWorker.worker = null;
            }
            return Promise.resolve();
          }
          else {

            // We choose here the better method to hash a file
            let hashMethod = null;
            if (testNativeCryptoSupport && files[i].size < HASH_NATIVE_LIMIT) {
              hashMethod = hashLocalWithNativeAPI;
            }
            else if (WorkerSupported && files[i].size > HASH_LOCAL_LIMIT) {
              if (!hashWorker) hashWorker = new HashWorker(); // if worker instance has already been called
              hashMethod = hashWorker.hash;
            }
            else {
              hashMethod = hashLocal;
            }

            return hashMethod(files[i])
              .then(() => iter(i + 1, len, files))
              .catch((err) => {
                if (err === SKIP_EXCEPTION)
                  return iter(i + 1, len, files);

                if (err !== CANCEL_EXCEPTION)
                  throw err;
              })
          }
        }

        // Entry point
        if (files instanceof FileList) { // files is a file list
          return iter(0, files.length, files);
        }
        else if (files instanceof File) { // files is a single file
          return iter(0, 1, [files]);
        }
        else { // files is an array of File
          return iter(0, files.length, files);
        }
      })

  };

  this.cancel = function () {
    if (cancel) {
      cancel();
      cancel = null;
      ready = true;
    }
  };

  this.skip = function () {
    if (cancel) {
      skip();
      skip = null;
    }
  };

  this.isReady = () => ready;
}

/**
 * @param {File|String} file
 * @param {Function} [progressCallback]
 * @returns {Promise<Hash>}
 */
function hashFileOrCheckHash(file, progressCallback) {
  return new Promise((resolve, reject) => {

    // If parameter is a file, hash it
    if (file instanceof File) {

      const hasher = new Hasher;

      hasher.on('result', (message, file) => {
        resolve(message.result);
        if (progressCallback) progressCallback({progress: 1.0, file})
      });

      if (progressCallback && typeof progressCallback === 'function')
        hasher.on('progress', progressCallback);

      hasher.on('error', reject);

      hasher.start(file)
    }

    // If parameter is a hash, check it is a valid SHA256 hash
    else if (typeof file === 'string') {
      if (isSHA256(file))
        resolve(file);
      else
        reject(new Error("parameter_string_not_a_sha256_hash"));
    }

    // Invalid parameter
    else
      reject(new Error("invalid_parameter"));
  });
}

module.exports = {Hasher, hashFileOrCheckHash};
