"use strict";

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

    var testFileReaderSupport = checkFileReaderSyncSupport();
    //noinspection JSUnresolvedVariable
    var testNativeCryptoSupport = window.crypto && window.crypto.subtle && window.crypto.subtle.digest;

    var api = woleet || {};
    api.file = api.file || {};

    /**
     * @returns string base path (including final '/') of the current script.
     */
    function findBasePath() {
        var scripts = document.getElementsByTagName('script');
        var scriptsArray = Array.prototype.slice.call(scripts, 0); // Converts collection to array
        var re = /.*woleet-(hashfile|weblibs)[.min]*\.js$/;
        var script = scriptsArray.find(function (e) {
            return e.src && e.src.match(re);
        });

        return script && script.src ? script.src.substr(0, script.src.lastIndexOf("/") + 1) : null;
    }

    // Guess the path of the worker script: same as current script's or defined by woleet.workerScriptPath
    var basePath = findBasePath();
    console.log(basePath);
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
         * @param {File} file
         * @returns {Promise}
         */
        var hashWorker = function hashWorker(file) {
            return new Promise(function (next, reject) {

                var worker = new Worker(workerScriptPath);

                worker.onmessage = function (message) {
                    //handling worker message
                    if (message.data.progress != undefined) {
                        if (cb_progress) cb_progress(message.data);
                    } else if (message.data.result) {
                        if (cb_result) cb_result(message.data);
                        next();
                    } else if (message.data.start) {
                        if (cb_start) cb_start(message.data);
                    } else if (message.data.error) {
                        var _error = message.data.error;
                        if (cb_error) cb_error(_error);else reject(_error);
                    } else {
                        console.trace("Unexpected worker message: ", message);
                    }
                };

                worker.postMessage(file);
            });
        };

        /**
         * @param {File} file
         * @returns {Promise}
         */
        var hashLocal = function hashLocal(file) {

            return new Promise(function (next, reject) {
                var err = new Error("file_too_big_to_be_hashed_without_worker");
                if (file.size > 5e7) {
                    ready = true;
                    if (cb_error) return cb_error({ error: err, file: file });else reject(error);
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
                    hashMethod = hashWorker;
                } else if (typeof CryptoJS !== 'undefined') {
                    hashMethod = hashLocal;
                } else {
                    throw new Error("no_viable_hash_method");
                }

                // set iterator function with selected hash method
                function iter(i, len) {
                    if (i >= len) {
                        ready = true;
                    } else {
                        hashMethod(files[i]).then(function () {
                            iter(++i, len);
                        });
                    }
                }

                // entry point
                if (files instanceof FileList) {
                    // files is a FileList
                    iter(0, files.length);
                } else if (files instanceof File) {
                    // files is a single file
                    hashMethod(files).then(function () {
                        ready = true;
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
    api._hashStringOrFile = function (file, progressCallback) {
        var resolveHash = void 0;
        var rejectHash = void 0;
        var hashPromise = new Promise(function (resolve, reject) {
            resolveHash = resolve;
            rejectHash = reject;
        });

        if (file instanceof File) {

            if (!api.file || !api.file.Hasher) throw new Error("missing_woleet_hash_dependency");

            var hasher = new api.file.Hasher();
            //noinspection JSUnusedLocalSymbols
            hasher.on('result', function (message, file) {
                resolveHash(message.result);
                if (progressCallback) progressCallback({ progress: 1.0, file: File });
            });

            if (progressCallback && typeof progressCallback == 'function') {
                hasher.on('progress', progressCallback);
            }

            hasher.on('error', function (error) {
                rejectHash(error);
            });

            hasher.start(file);
        } else if (typeof file == "string") {
            if (api.isSHA256(file)) {
                //noinspection JSUnusedAssignment
                resolveHash(file);
            } else {
                //noinspection JSUnusedAssignment
                rejectHash(new Error("parameter_string_not_a_sha256_hash"));
            }
        } else {
            //noinspection JSUnusedAssignment
            rejectHash(new Error("invalid_parameter"));
        }

        return hashPromise;
    };

    return api;
});