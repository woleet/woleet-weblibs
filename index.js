const EventEmitter = require('events').EventEmitter;
const crypto = require('crypto');
const https = require('https');
const URL = require('url');
const Readable = require('stream').Readable;

/**
 * @param {String} url
 * @param {{method?:string, data?:string, token?:string}} options
 * @returns {Promise}
 */
function getJSON(url, options = {}) {

    const _url = URL.parse(url);

    let postData = options.data ? JSON.stringify(options.data) : undefined;
    let requestOptions = {
        host: _url.host,
        path: _url.path,
        method: options.method || 'GET',
        headers: {
            'Accept': 'application/json'
        }
    };

    if (options.token) requestOptions.headers['Authorization'] = 'Bearer ' + options.token;
    if (options.method === 'POST') requestOptions.headers['Content-Length'] = Buffer.byteLength(postData);
    if (postData) requestOptions.headers['Content-Type'] = 'application/json';

    return new Promise((resolve, reject) => {
        let req = https.request(requestOptions, (res) => {
            res.setEncoding('utf8');
            let resData = '';
            res.on('data', (chunk) => resData += chunk);

            res.on('error', reject);

            res.on('end', () => {
                let json = null;
                switch (res.statusCode) {
                    case 200:
                    case 201:
                        try {
                            json = JSON.parse(resData);
                            resolve(json)
                        } catch (err) {
                            reject(err);
                        }
                        break;
                    case 404:
                        resolve(null);
                        break;
                    default:
                        reject({code: req.statusCode});
                        break;
                }
            });
        });

        if (postData) req.write(postData);

        req.on('error', () => reject({code: 0}));

        req.end();
    }).catch((err) => {
        const error = new Error('http_error');
        error.code = err.code;
        throw error;
    });
}

const woleet = require('./lib/woleet-api')({}, getJSON);

// defining crypto
woleet.crypto = {
    createHash: crypto.createHash,
    sha224: () => crypto.createHash('sha224'),
    sha256: () => crypto.createHash('sha256'),
    sha384: () => crypto.createHash('sha384'),
    sha512: () => crypto.createHash('sha512'),
};

// defining receipt.validate (woleet-chainpoint)
require('./lib/woleet-chainpoint')(woleet);

const validHashParameter = (file) => (file instanceof Readable) || Buffer.isBuffer(file);

/**
 * @extends EventEmitter
 * @constructor
 */
function Hasher() {

    const self = this;
    let cancel = null;
    let _ready = true;

    function handleCancel(err) {
        if (err !== 'cancel') throw err;
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
            } catch (err) {
                console.log(err.message, fileStream);
                reject(err);
            }
            cancel = () => reader.destroy('cancel')
        })
    }

    /**
     * @param {stream.readable[]} files
     * @returns {Promise.<string>}
     */
    const hashFiles = (files) => files.reduce((stack, file) => stack.then(hashFile), Promise.resolve());

    /**
     * @param {stream.readable[]|stream.readable} files
     * @returns {*}
     */
    this.start = (files) => {
        _ready = false;
        if (Array.isArray(files)) {
            if (!files.every(validHashParameter)) throw new Error("invalid_parameter");
            hashFiles(files).catch(handleCancel).then(() => _ready = true);
        } else {
            if (!validHashParameter(files)) throw new Error("invalid_parameter");
            hashFile(files).catch(handleCancel).then(() => _ready = true);
        }
    };

    this.cancel = () => cancel();

    this.isReady = () => _ready;

}

Hasher.prototype.__proto__ = EventEmitter.prototype;

/**
 * @param {File|String} file
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

// defining signature (woleet-signature)
require('./lib/woleet-signature')(woleet);

// defining verify (woleet-verify)
require('./lib/woleet-verify')(woleet);

/**
 * @type woleet
 */
module.exports = woleet;