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

    const testFileReaderSupport = checkFileReaderSyncSupport();
    //noinspection JSUnresolvedVariable
    const testNativeCryptoSupport = window.crypto && window.crypto.subtle && window.crypto.subtle.digest;

    const api = woleet || {};
    api.file = api.file || {};

    /**
     * @returns string base path (including final '/') of the current script.
     */
    function findBasePath() {
        let scripts = document.getElementsByTagName('script'),
            script = scripts[scripts.length - 1].src; // last script is always the current script
        return script.substr(0, script.lastIndexOf("/") + 1);
    }

    // Guess the path of the worker script: same as current script's or defined by woleet.workerScriptPath
    let basePath = findBasePath();
    let DEFAULT_WORKER_SCRIPT = "worker.min.js";
    //noinspection JSUnresolvedVariable
    let workerScriptPath = (api.workerScriptPath || (basePath ? basePath + DEFAULT_WORKER_SCRIPT : null));
    if (!workerScriptPath)
        throw new Error('Cannot find ' + DEFAULT_WORKER_SCRIPT);

    /**
     * Check support for workers.
     */
    function checkFileReaderSyncSupport() {

        function makeWorker(script) {
            //noinspection JSUnresolvedVariable
            let URL = window.URL || window.webkitURL;
            let Blob = window.Blob;
            let Worker = window.Worker;

            if (!URL || !Blob || !Worker || !script) return null;

            let blob = new Blob([script]);
            //noinspection JSUnresolvedFunction
            return new Worker(URL.createObjectURL(blob));
        }

        return new Promise(function (resolve) {
            let syncDetectionScript = "onmessage = function(e) { postMessage(!!FileReaderSync); };";
            try {
                let worker = makeWorker(syncDetectionScript);
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

    api.file.Hasher = function () {

        let ready = true;
        let cb_start, cb_progress, cb_result, cb_error;

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
        const hashWorker = function (file) {
            return new Promise((next, reject) => {

                let worker = new Worker(workerScriptPath);

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
                        let error = message.data.error;
                        if (cb_error) cb_error(error);
                        else reject(error);
                    }
                    else {
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
        const hashLocal = function (file) {

            return new Promise((next, reject) => {
                let err = new Error("file_too_big_to_be_hashed_without_worker");
                if (file.size > 5e7) {
                    ready = true;
                    if (cb_error) return cb_error({error: err, file: file});
                    else reject(error);
                }

                let reader = new FileReader();

                let sha256 = CryptoJS.algo.SHA256.create();
                let hash, prev = 0;

                reader.onloadstart = () => {
                    if (cb_start) cb_start({start: true, file: file});
                };

                reader.onloadend = () => {
                    hash.finalize();
                    if (cb_result) cb_result({
                        result: hash._hash.toString(CryptoJS.enc.Hex),
                        file: file
                    });
                    next();
                };

                reader.onprogress = (e) => {
                    //noinspection JSUnresolvedVariable
                    /** @type ArrayBuffer */
                    let buf = e.target.result;
                    //noinspection JSUnresolvedVariable
                    let blob = buf.slice(prev, e.loaded);
                    let chunkUint8 = new Uint8Array(blob);
                    let wordArr = CryptoJS.lib.WordArray.create(chunkUint8);
                    hash = sha256.update(wordArr);
                    //noinspection JSUnresolvedVariable
                    prev = e.loaded;
                    if (cb_progress) {
                        //noinspection JSUnresolvedVariable
                        cb_progress({progress: (e.loaded / e.total), file: file});
                    }
                };

                reader.readAsArrayBuffer(file);
            });
        };

        /**
         * @param {File} file
         * @returns {Promise}
         */
        const hashLocalWithNativeAPI = function (file) {
            return new Promise((resolve, reject) => {
                let algo = "SHA-256";
                // entry point
                let reader = new FileReader();

                reader.onloadstart = () => {
                    if (cb_start) cb_start({start: true, file: file});
                };

                reader.onprogress = (e) => {
                    if (cb_progress) { //noinspection JSUnresolvedVariable
                        cb_progress({progress: (e.loaded / e.total), file: file});
                    }
                };

                reader.onload = function (event) {
                    let data = event.target.result;
                    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
                    window.crypto.subtle.digest(algo, data)
                        .then(function (hash) {
                            let hashResult = new Uint8Array(hash);
                            let hexString = hashResult.reduce((res, e) => res + e.toString(16), '');
                            if (cb_result) cb_result({result: hexString, file: file});
                            resolve();
                        })
                        .catch((error) => cb_error ? cb_error({error: error, file: file}) : reject(error));
                };

                reader.readAsArrayBuffer(file);
            })
        };

        this.start = function (files) {

            if (!ready) throw new Error("not_ready");

            ready = false;

            testFileReaderSupport
                .then((WorkerSupported) => {
                    let hashMethod = null;
                    if (testNativeCryptoSupport) {
                        hashMethod = hashLocalWithNativeAPI;
                    }
                    else if (WorkerSupported) {
                        hashMethod = hashWorker;
                    }
                    else if (typeof CryptoJS !== 'undefined') {
                        hashMethod = hashLocal;
                    }
                    else {
                        throw new Error("no_viable_hash_method");
                    }

                    // set iterator function with selected hash method
                    function iter(i, len) {
                        if ((i >= len)) {
                            ready = true;
                        }
                        else {
                            hashMethod(files[i]).then(() => {
                                iter(++i, len)
                            })
                        }
                    }

                    // entry point
                    if (files instanceof FileList) { // files is a FileList
                        iter(0, files.length);
                    }
                    else if (files instanceof File) { // files is a single file
                        hashMethod(files).then(() => {
                            ready = true;
                        })
                    }
                    else throw new Error("invalid_parameter");
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
        let resolveHash;
        let rejectHash;
        let hashPromise = new Promise(function (resolve, reject) {
            resolveHash = resolve;
            rejectHash = reject;
        });

        if (file instanceof File) {

            if (!api.file || !api.file.Hasher) throw new Error("missing_woleet_hash_dependency");

            let hasher = new api.file.Hasher;
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