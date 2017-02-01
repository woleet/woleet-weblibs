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
    root.woleet = factory(root.woleet)
})(window, function (woleet) {

    /**
     * @returns the base path (including final '/') of the current script.
     */
    function findBasePath() {
        var scripts = document.getElementsByTagName('script'),
            script = scripts[scripts.length - 1].src, // last script is always the current script
            basePath = script.substr(0, script.lastIndexOf("/") + 1);
        return basePath;
    }

    // Guess the path of the worker script: same as current script's or defined by woleet.workerScriptPath
    var basePath = findBasePath();
    var DEFAUlT_WORKER_SCRIPT = "worker.min.js";
    var workerScriptPath = (woleet.workerScriptPath || (basePath ? basePath + DEFAUlT_WORKER_SCRIPT : null));
    if (!workerScriptPath)
        throw new Error('Cannot find ' + DEFAUlT_WORKER_SCRIPT);

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
                }
                else resolve(false);
            } catch (err) {
                resolve(false);
            }
        });
    }

    var testFileReaderSupport = checkFileReaderSyncSupport();

    var api = woleet || {};
    api.file = api.file || {};

    api.file.Hasher = function () {

        var ready = true;
        var cb_start, cb_progress, cb_result, cb_error;

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
         * @param {FileList|File} files
         * @param {Number} len
         */
        var hashWorker = function (files, len) {
            var i = 0;
            var worker = new Worker(workerScriptPath);

            worker.onmessage = function (message) {//handling worker message
                if (message.data.progress != undefined) {
                    if (cb_progress) cb_progress(message.data);
                }
                else if (message.data.result) {
                    if (cb_result) cb_result(message.data);
                    next();
                }
                else if (message.data.start) {
                    if (cb_start) cb_start(message.data);
                }
                else if (message.data.error) {
                    var error = message.data.error;
                    if (cb_error) cb_error(error);
                    else throw error;
                }
                else {
                    console.trace("Unexpected worker message: ", message);
                }
            };

            function next() {
                if ((i >= len)) {
                    worker.terminate();
                    ready = true;
                }
                else {
                    worker.postMessage(files.item(i));
                    i++;
                }
            }

            //entry point
            if (len != -1) next();// if files is a list
            else {
                worker.postMessage(files);
            }
        };

        /**
         * @param {FileList|File} files
         * @param {Number} len
         */
        var hashLocal = function (files, len) {
            var i = 0;

            /**
             * @param {File} file
             */
            function hash(file) {
                var err = new Error("file_too_big_to_be_hashed_without_worker");
                if (file.size > 5e7) {
                    ready = true;
                    if (cb_error) return cb_error({error: err, file: file});
                    else throw err;
                }
                if (cb_start) cb_start({start: true, file: file});

                var reader = new FileReader();

                var sha256 = CryptoJS.algo.SHA256.create();
                var hash, prev = 0;

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
                        cb_progress({progress: (e.loaded / e.total), file: file});
                    }
                };

                reader.readAsArrayBuffer(file);
            }

            function next() {
                if ((i >= len)) {
                    ready = true;
                }
                else {
                    hash(files.item(i));
                    i++;
                }
            }

            //entry point
            if (len != -1) next();// if files is a list
            else {
                hash(files);
            }
        };

        this.start = function (files) {

            if (!ready) throw new Error("not_ready");

            var len = -1;

            if (files instanceof FileList) {
                len = files.length;
            }
            else if (files instanceof File) {

            }
            else throw new Error("invalid_parameter");

            ready = false;

            testFileReaderSupport.then(function (supported) {
                if (supported) {
                    hashWorker(files, len);
                }
                else if (typeof CryptoJS !== 'undefined') {
                    hashLocal(files, len);
                }
                else {
                    throw new Error("no_viable_hash_method");
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
        var resolveHash;
        var rejectHash;
        var hashPromise = new Promise(function (resolve, reject) {
            resolveHash = resolve;
            rejectHash = reject;
        });

        if (file instanceof File) {

            if (!api.file || !api.file.Hasher) throw new Error("missing_woleet_hash_dependency");

            var hasher = new api.file.Hasher;
            //noinspection JSUnusedLocalSymbols
            hasher.on('result', function (message, file) {
                resolveHash(message.result);
                if (progressCallback) progressCallback({progress: 1.0, file: File})
            });

            if (progressCallback && typeof progressCallback == 'function') {
                hasher.on('progress', progressCallback);
            }

            hasher.on('error', function (error) {
                rejectHash(error);
            });

            hasher.start(file)
        }
        else if (typeof file == "string") {
            if (api.isSHA256(file)) {
                //noinspection JSUnusedAssignment
                resolveHash(file);
            }
            else {
                //noinspection JSUnusedAssignment
                rejectHash(new Error("parameter_string_not_a_sha256_hash"));
            }
        }
        else {
            //noinspection JSUnusedAssignment
            rejectHash(new Error("invalid_parameter"));
        }

        return hashPromise;
    };

    return api;
});