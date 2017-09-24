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

;(function (factory) {
    if (typeof window !== 'undefined') {
        const root = window;
        module.exports = factory(root.woleet, root);
    } else {
        throw new Error('This module is not meant to be used by node')
    }
})(function (woleet = {}, root) {

    /**
     * @param {Hash} hash
     * @returns {boolean}
     */
    const isSHA256 = (hash) => /^[a-f0-9]{64}$/i.test(hash);
    const crypto = woleet.crypto;

    const isHTTPS = location.protocol === 'https:';

    //noinspection JSUnresolvedVariable
    const testNativeCryptoSupport = root.crypto && root.crypto.subtle && root.crypto.subtle.digest && isHTTPS;

    const testFileReaderSupport = checkFileReaderSyncSupport();

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
        console.warn('Cannot find ' + DEFAULT_WORKER_SCRIPT);

    /**
     * Check support for workers.
     */
    function checkFileReaderSyncSupport() {

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

        return new Promise(function (resolve) {
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
    }

    function Hasher() {
        let ready = true;
        let cb_start, cb_progress, cb_result, cb_error;
        let cancel = null;
        const onCancel = (cb) => cancel = cb;

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
        const HashWorker = function () {

            let worker = new Worker(workerScriptPath);

            /**
             * @param {File} file
             * @returns {Promise}
             */
            this.hash = function (file) {
                return new Promise((next, reject) => {

                    onCancel(() => {
                        worker.terminate();
                        worker = null;
                        reject('cancelled')
                    });

                    worker.onmessage = function (message) {//handling worker message
                        if (message.data.progress !== undefined) {
                            if (cb_progress) cb_progress(message.data);
                        }
                        else if (message.data.result) {
                            if (cb_result) cb_result(message.data);
                            next(worker);
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

        };

        const HASH_LOCAL_LIMIT = 5e7; // ~50MB
        const HASH_NATIVE_LIMIT = 5e8; // ~500MB

        /**
         * @param {File} file
         * @returns {Promise}
         */
        const hashLocal = function (file) {
            return new Promise((next, reject) => {
                let error = new Error("file_too_big_to_be_hashed_without_worker");
                if (file.size > HASH_LOCAL_LIMIT) {
                    ready = true;
                    if (cb_error) return cb_error({error, file});
                    else reject(error);
                }

                let prev = 0;
                let cancelled = false;
                let report_update = false;
                const sha256 = crypto.sha256();
                const reader = new FileReader();

                /**
                 * @param {ArrayBuffer} buf
                 * @param {Number} loaded
                 */
                function update(buf, loaded) {
                    //noinspection JSUnresolvedVariable
                    const blob = buf.slice(prev, loaded);
                    const chunkUint8 = new Uint8Array(blob);
                    sha256.update(chunkUint8);
                    prev = loaded;
                }

                onCancel(() => {
                    cancelled = true;
                    reader.abort()
                });

                reader.onloadstart = () => {
                    if (cancelled) return;
                    if (cb_start) cb_start({start: true, file});
                };

                reader.onloadend = (e) => {
                    if (cancelled) return;

                    if (report_update) {
                        //noinspection JSCheckFunctionSignatures,JSUnresolvedVariable
                        update(e.target.result, e.loaded, e.total);
                    }

                    if (cb_result) cb_result({
                        result: sha256.digest('hex'),
                        file: file
                    });
                    next();
                };

                reader.onprogress = (e) => {
                    if (cancelled) return;

                    if (cb_progress) {
                        //noinspection JSUnresolvedVariable
                        cb_progress({progress: (e.loaded / e.total), file});
                    }

                    //noinspection JSUnresolvedVariable
                    if (!e.target.result)
                        return report_update = true;
                    //noinspection JSCheckFunctionSignatures,JSUnresolvedVariable
                    update(e.target.result, e.loaded, e.total);

                };

                reader.onabort = () => {
                    reject('cancelled')
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
                const alg = "SHA-256";
                let cancelled = false;
                // entry point
                const reader = new FileReader();

                onCancel(() => {
                    cancelled = true;
                    reader.abort()
                });

                reader.onloadstart = () => {
                    if (cancelled) return;
                    if (cb_start) cb_start({start: true, file});
                };

                reader.onprogress = (e) => {
                    if (cancelled) return;
                    if (cb_progress) { //noinspection JSUnresolvedVariable
                        cb_progress({progress: (e.loaded / e.total), file});
                    }
                };

                reader.onload = function (event) {
                    if (cancelled) return;
                    let data = event.target.result;
                    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
                    root.crypto.subtle.digest(alg, data)
                        .then((hash) => {
                            let hashResult = new Uint8Array(hash);
                            let result = hashResult.reduce((res, e) => res + ('00' + e.toString(16)).slice(-2), '');
                            if (cb_result) cb_result({result, file});
                            resolve();
                        })
                        .catch((error) => cb_error ? cb_error({error, file}) : reject(error));
                };

                reader.onabort = () => {
                    reject('cancelled')
                };

                reader.readAsArrayBuffer(file);
            })
        };

        this.start = function (files) {

            let hashWorker = null; // We may have to keep the hashWorker

            if (!ready) throw new Error("not_ready");

            ready = false;

            // checking input type
            if (!(files instanceof FileList || files instanceof File || (Array.isArray(files) && files.every((file) => file instanceof File))))
                throw new Error("invalid_parameter");

            testFileReaderSupport
                .then((WorkerSupported) => {

                    /**
                     * iterator function with selected hash method
                     * @param {Number} i current index of the list
                     * @param {Number} len total size of the list
                     * @param {FileList|[File]} files file list
                     * @param {Worker} [worker] passing worker through iterator if selected method is hashWorker in order to terminate it
                     */
                    function iter(i, len, files, worker) {

                        if ((i >= len)) {
                            ready = true;
                            if (worker) {
                                worker.terminate();
                                worker = null;
                            }
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
                                .then((_worker) => iter(i + 1, len, files, _worker || worker))
                                .catch((err) => {
                                    if (err !== 'cancelled') throw err;
                                })
                        }
                    }

                    // entry point
                    if (files instanceof FileList) { // files is a FileList
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
                    if (progressCallback)
                        progressCallback({progress: 1.0, file})
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

    return woleet.file = {Hasher, hashFileOrCheckHash};
});

