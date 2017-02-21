'use strict';

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

;(function (root, factory) {
    root.woleet = factory(root.woleet);
})(window, function (woleet) {

    var api = woleet || {};
    api.file = api.file || {};

    var isHTTPS = location.protocol == 'https:';

    //noinspection JSUnresolvedVariable
    var testNativeCryptoSupport = window.crypto && window.crypto.subtle && window.crypto.subtle.digest && isHTTPS;

    var testFileReaderSupport = checkFileReaderSyncSupport();

    /**
     * @returns {String} get the base path (including final '/') of the current script.
     */
    function findBasePath() {
        var scripts = document.getElementsByTagName('script');
        var scriptsArray = Array.prototype.slice.call(scripts, 0); // Converts collection to array
        var regex = /.*woleet-(hashfile|weblibs)[.min]*\.js$/;
        var script = scriptsArray.find(function (script) {
            return script.src && script.src.match(regex);
        });
        return script && script.src ? script.src.substr(0, script.src.lastIndexOf("/") + 1) : null;
    }

    // Guess the path of the worker script: same as current script's or defined by woleet.workerScriptPath
    var basePath = findBasePath();
    var DEFAULT_WORKER_SCRIPT = "woleet-hashfile-worker.min.js";
    //noinspection JSUnresolvedVariable
    var workerScriptPath = api.workerScriptPath || (basePath ? basePath + DEFAULT_WORKER_SCRIPT : null);
    if (!workerScriptPath) throw new Error('Cannot find ' + DEFAULT_WORKER_SCRIPT);

    /**
     * Check support for workers.
     */
    function checkFileReaderSyncSupport() {

        function makeWorker(script) {
            //noinspection JSUnresolvedVariable
            var URL = window.URL || window.webkitURL;
            var Blob = window.Blob;
            var Worker = window.Worker;

            if (!URL || !Blob || !Worker || !script) return null;

            var blob = new Blob([script]);
            //noinspection JSUnresolvedFunction
            return new Worker(URL.createObjectURL(blob));
        }

        return new Promise(function (resolve) {
            var syncDetectionScript = "onmessage = function(e) { postMessage(!!FileReaderSync); };";
            try {
                var worker = makeWorker(syncDetectionScript);
                if (worker) {
                    worker.onmessage = function (e) {
                        resolve(e.data);
                    };
                    worker.postMessage({});
                } else resolve(false);
            } catch (err) {
                resolve(false);
            }
        });
    }

    api.file.Hasher = function () {

        var ready = true;
        var cb_start = void 0,
            cb_progress = void 0,
            cb_result = void 0,
            cb_error = void 0;

        /**
         * @param {String} event
         * @param {Function} callback
         */
        this.on = function (event, callback) {
            switch (event) {
                case 'start':
                    cb_start = callback;
                    break;
                case 'progress':
                    cb_progress = callback;
                    break;
                case 'error':
                    cb_error = callback;
                    break;
                case 'result':
                    cb_result = callback;
                    break;
                default:
                    throw new Error('Invalid event name "' + event + '"');
            }
        };

        /**
         * @constructor
         */
        var HashWorker = function HashWorker() {

            var worker = new Worker(workerScriptPath);

            /**
             * @param {File} file
             * @returns {Promise}
             */
            this.hash = function (file) {
                return new Promise(function (next, reject) {

                    worker.onmessage = function (message) {
                        //handling worker message
                        if (message.data.progress != undefined) {
                            if (cb_progress) cb_progress(message.data);
                        } else if (message.data.result) {
                            if (cb_result) cb_result(message.data);
                            next(worker);
                        } else if (message.data.start) {
                            if (cb_start) cb_start(message.data);
                        } else if (message.data.error) {
                            var error = message.data.error;
                            if (cb_error) cb_error(error);else reject(error);
                        } else {
                            console.trace("Unexpected worker message: ", message);
                        }
                    };

                    worker.postMessage(file);
                });
            };
        };

        /**
         * @param {File} file
         * @returns {Promise}
         */
        var hashLocal = function hashLocal(file) {

            return new Promise(function (next, reject) {
                var error = new Error("file_too_big_to_be_hashed_without_worker");
                if (file.size > 5e7) {
                    ready = true;
                    if (cb_error) return cb_error({ error: error, file: file });else reject(error);
                }

                var reader = new FileReader();

                var sha256 = CryptoJS.algo.SHA256.create();
                var hash = void 0,
                    prev = 0;

                reader.onloadstart = function () {
                    if (cb_start) cb_start({ start: true, file: file });
                };

                reader.onloadend = function () {
                    hash.finalize();
                    if (cb_result) cb_result({
                        result: hash._hash.toString(CryptoJS.enc.Hex),
                        file: file
                    });
                    next();
                };

                reader.onprogress = function (e) {
                    //noinspection JSUnresolvedVariable
                    /** @type ArrayBuffer */
                    var buf = e.target.result;
                    //noinspection JSUnresolvedVariable
                    var blob = buf.slice(prev, e.loaded);
                    var chunkUint8 = new Uint8Array(blob);
                    var wordArr = CryptoJS.lib.WordArray.create(chunkUint8);
                    hash = sha256.update(wordArr);
                    //noinspection JSUnresolvedVariable
                    prev = e.loaded;
                    if (cb_progress) {
                        //noinspection JSUnresolvedVariable
                        cb_progress({ progress: e.loaded / e.total, file: file });
                    }
                };

                reader.readAsArrayBuffer(file);
            });
        };

        /**
         * @param {File} file
         * @returns {Promise}
         */
        var hashLocalWithNativeAPI = function hashLocalWithNativeAPI(file) {
            return new Promise(function (resolve, reject) {
                var algo = "SHA-256";
                // entry point
                var reader = new FileReader();

                reader.onloadstart = function () {
                    if (cb_start) cb_start({ start: true, file: file });
                };

                reader.onprogress = function (e) {
                    if (cb_progress) {
                        //noinspection JSUnresolvedVariable
                        cb_progress({ progress: e.loaded / e.total, file: file });
                    }
                };

                reader.onload = function (event) {
                    var data = event.target.result;
                    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
                    window.crypto.subtle.digest(algo, data).then(function (hash) {
                        var hashResult = new Uint8Array(hash);
                        var hexString = hashResult.reduce(function (res, e) {
                            return res + ('00' + e.toString(16)).slice(-2);
                        }, '');
                        if (cb_result) cb_result({ result: hexString, file: file });
                        resolve();
                    }).catch(function (error) {
                        return cb_error ? cb_error({ error: error, file: file }) : reject(error);
                    });
                };

                reader.readAsArrayBuffer(file);
            });
        };

        this.start = function (files) {

            if (!ready) throw new Error("not_ready");

            ready = false;

            // checking input type
            if (!(files instanceof FileList || files instanceof File)) throw new Error("invalid_parameter");

            testFileReaderSupport.then(function (WorkerSupported) {
                var hashMethod = null;
                if (testNativeCryptoSupport) {
                    hashMethod = hashLocalWithNativeAPI;
                } else if (WorkerSupported) {
                    var hashWorker = new HashWorker();
                    hashMethod = hashWorker.hash;
                } else if (typeof CryptoJS !== 'undefined') {
                    hashMethod = hashLocal;
                } else {
                    throw new Error("no_viable_hash_method");
                }

                /**
                 * iterator function with selected hash method
                 * @param i current index of the list
                 * @param len total size of the list
                 * @param worker passing worker through iterator if selected method is hashWorker in order to terminate it
                 */
                function iter(i, len, worker) {
                    if (i >= len) {
                        ready = true;
                        if (worker) worker.terminate();
                    } else {
                        hashMethod(files[i]).then(function (worker) {
                            iter(++i, len, worker);
                        });
                    }
                }

                // entry point
                if (files instanceof FileList) {
                    // files is a FileList
                    iter(0, files.length);
                } else if (files instanceof File) {
                    // files is a single file
                    hashMethod(files).then(function (worker) {
                        iter(1, 0, worker); // set ready state with iter function (i > len)
                    });
                }
            });
        };

        this.isReady = function () {
            return ready;
        };
    };

    /**
     * @param {File|String} file
     * @param {Function} [progressCallback]
     * @returns {Promise<Hash>}
     */
    api.hashFileOrCheckHash = function (file, progressCallback) {
        return new Promise(function (resolve, reject) {

            // If parameter is a file, hash it
            if (file instanceof File) {

                if (!api.file || !api.file.Hasher) throw new Error("missing_woleet_hash_dependency");

                var hasher = new api.file.Hasher();

                hasher.on('result', function (message, file) {
                    resolve(message.result);
                    if (progressCallback) progressCallback({ progress: 1.0, file: file });
                });

                if (progressCallback && typeof progressCallback == 'function') hasher.on('progress', progressCallback);

                hasher.on('error', reject);

                hasher.start(file);
            }

            // If parameter is a hash, check it is a valid SHA256 hash
            else if (typeof file == "string") {
                    if (api.isSHA256(file)) resolve(file);else reject(new Error("parameter_string_not_a_sha256_hash"));
                }

                // Invalid parameter
                else reject(new Error("invalid_parameter"));
        });
    };

    return api;
});