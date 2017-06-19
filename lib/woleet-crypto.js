;(function (factory) {
    const root = typeof window !== 'undefined' ? window : {woleet: {}};
    return module.exports = factory(root.woleet, root);
})(function (woleet = {}) {
    const CryptoJS = (((factory) => factory(
        require("../node_modules/crypto-js/core"),
        require("../node_modules/crypto-js/sha256"),
        require("../node_modules/crypto-js/lib-typedarrays")
    ))(CryptoJS => CryptoJS));

    const _sha256 = CryptoJS.algo.SHA256;
    const WordArray = CryptoJS.lib.WordArray;

    function sha256() {
        const sha256 = _sha256.create();
        let hash = null;

        const o = {};

        /**
         * @param {Uint8Array|WordArray} data
         */
        o.update = function (data) {
            let _data;
            if (data instanceof Uint8Array) {
                _data = WordArray.create(data)
            } else if (WordArray.isPrototypeOf(data)) {
                _data = data;
            } else if (!data) {
                _data = WordArray.create();
            } else if (typeof data === 'string') {
                _data = data;
            } else {
                throw new TypeError();
            }

            hash = sha256.update(_data);
            return o;
        };

        o.digest = function () {
            if (!hash)
                hash = sha256.update(WordArray.create());

            hash.finalize();
            return hash._hash.toString(/* CryptoJS.enc.Hex */);
        };

        return o;
    }

    function createHash(algorithm) {
        switch (algorithm) {
            case 'sha256' :
                return sha256();
            default:
                throw new Error('Not supported')
        }
    }

    return woleet.crypto = {createHash, sha256};
});