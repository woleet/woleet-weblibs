;(function (factory) {
    let __in_worker;
    if (typeof window !== 'undefined' || (__in_worker = typeof _in_worker !== 'undefined')) {
        const root = __in_worker ? {} : window;
        module.exports = factory(root.woleet);
    } else {
        throw new Error('This module is not meant to be used by node')
    }
})(function (woleet = {}) {
    const CryptoJS = (((factory) => factory(
        require("../node_modules/crypto-js/core"),
        require("../node_modules/crypto-js/sha224"),
        require("../node_modules/crypto-js/sha256"),
        require("../node_modules/crypto-js/sha384"),
        require("../node_modules/crypto-js/sha512"),
        require("../node_modules/crypto-js/lib-typedarrays")
    ))(CryptoJS => CryptoJS));

    const WordArray = CryptoJS.lib.WordArray;

    /**
     * @param alg
     * @returns {{}}
     */
    function createSha(alg) {
        const hash = CryptoJS.algo[alg].create();

        const o = {};

        /**
         * @param {Buffer | Uint8Array | WordArray | string} data
         * @param {'utf8' | 'binary' | 'hex' | 'base64'} [inputEncoding]
         */
        o.update = function (data, inputEncoding) {
            let _data;
            if (data instanceof Uint8Array) {
                _data = WordArray.create(data)
            } else if (WordArray.isPrototypeOf(data)) {
                _data = data;
            } else if (inputEncoding) {
                switch (inputEncoding) {
                    case 'binary':
                        const len = data.length;
                        const arr = new Uint8Array(len);
                        for (let i = 0; i < len; i++) arr[i] = data.charCodeAt(i)
                        _data = WordArray.create(arr);
                        break;
                    case 'hex':
                        _data = CryptoJS.enc.Hex.parse(data);
                        break;
                    case 'utf8':
                        _data = data;
                        break;
                    case 'base64':
                    default:
                        _data = WordArray.create(new Buffer(data, inputEncoding))
                }
            } else if (!data) {
                _data = WordArray.create();
            } else if (typeof data === 'string') {
                _data = data;
            } else {
                throw new TypeError();
            }
            hash.update(_data);
            return o;
        };

        /**
         * @param encoding
         * @returns {Buffer | string}
         */
        o.digest = function (encoding) {
            const bin = new Buffer(CryptoJS.enc.Hex.stringify(hash.finalize()), 'hex');
            return encoding ? bin.toString(encoding) : bin;
        };

        return o;
    }

    function createHash(algorithm) {
        switch (algorithm) {
            case 'sha224' :
                return createSha('SHA224');
            case 'sha256' :
                return createSha('SHA256');
            case 'sha384' :
                return createSha('SHA384');
            case 'sha512' :
                return createSha('SHA512');
            default:
                throw new Error('Not supported')
        }
    }

    return woleet.crypto = {
        createHash, CryptoJS, Buffer,
        sha256: () => createHash('sha256'),
        sha224: () => createHash('sha224'),
        sha384: () => createHash('sha384'),
        sha512: () => createHash('sha512')
    };
});