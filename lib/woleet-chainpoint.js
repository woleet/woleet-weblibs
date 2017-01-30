/**
 * @typedef {Object}   Leaf
 * @typedef {Hash}     Leaf.left
 * @typedef {Hash}     Leaf.right
 * @typedef {Hash}     Leaf.parent
 */

/**
 * @typedef {Object}   Receipt
 * @typedef {Object}   Receipt.header
 * @typedef {String}   Receipt.header.chainpoint_version
 * @typedef {String}   Receipt.header.hash_type
 * @typedef {String}   Receipt.header.merkle_root
 * @typedef {String}   Receipt.header.tx_id
 * @typedef {String}   Receipt.header.timestamp
 * @typedef {Object}   Receipt.target
 * @typedef {String}   Receipt.target.target_hash
 * @typedef {String}   Receipt.target.target_URI
 * @typedef {Leaf[]}   Receipt.target.target_proof
 * @typedef {Object[]} Receipt.extra
 */

;(function (root, factory) {
    root.woleet = factory(root.woleet)
})(window, function (woleet) {

    /**
     * @typedef {String} Hash
     * @typedef {function(String): Hash} HashFunction
     */

    /**
     * @type HashFunction
     * @param {String} content
     * @returns {Hash}
     */

    var sha256 = (function () {

        /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
        /* SHA-256 (FIPS 180-4) implementation in JavaScript                  (c) Chris Veness 2002-2016  */
        /*                                                                                   MIT Licence  */
        /* www.movable-type.co.uk/scripts/sha256.html                                                     */
        /*                                                                                                */
        /*  - see http://csrc.nist.gov/groups/ST/toolkit/secure_hashing.html                              */
        /*        http://csrc.nist.gov/groups/ST/toolkit/examples.html                                    */
        /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

        'use strict';

        function R(n, x) {
            //noinspection JSConstructorReturnsPrimitive
            return (x >>> n) | (x << (32 - n));
        }

        function F0(x) {
            //noinspection JSConstructorReturnsPrimitive
            return R(2, x) ^ R(13, x) ^ R(22, x);
        }

        function F1(x) {
            //noinspection JSConstructorReturnsPrimitive
            return R(6, x) ^ R(11, x) ^ R(25, x);
        }

        function S0(x) {
            //noinspection JSConstructorReturnsPrimitive
            return R(7, x) ^ R(18, x) ^ (x >>> 3);
        }

        function S1(x) {
            //noinspection JSConstructorReturnsPrimitive
            return R(17, x) ^ R(19, x) ^ (x >>> 10);
        }

        function Ch(x, y, z) {
            //noinspection JSConstructorReturnsPrimitive
            return (x & y) ^ (~x & z);
        }

        function Maj(x, y, z) {
            //noinspection JSConstructorReturnsPrimitive
            return (x & y) ^ (x & z) ^ (y & z);
        }

        return function (msg) {
            var K = [
                0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
                0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
                0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
                0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
                0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
                0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
                0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
                0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];

            var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

            msg += String.fromCharCode(0x80);
            var l = msg.length / 4 + 2;
            var N = Math.ceil(l / 16);
            var M = new Array(N);

            for (var i = 0; i < N; i++) {
                M[i] = new Array(16);
                for (var j = 0; j < 16; j++) {
                    M[i][j] = (msg.charCodeAt(i * 64 + j * 4) << 24) | (msg.charCodeAt(i * 64 + j * 4 + 1) << 16) |
                        (msg.charCodeAt(i * 64 + j * 4 + 2) << 8) | (msg.charCodeAt(i * 64 + j * 4 + 3));
                }
            }
            var lenHi = ((msg.length - 1) * 8) / Math.pow(2, 32);
            var lenLo = ((msg.length - 1) * 8) >>> 0;
            M[N - 1][14] = Math.floor(lenHi);
            M[N - 1][15] = lenLo;

            for (let i = 0; i < N; i++) {
                let W = new Array(64);

                for (let t = 0; t < 16; t++) W[t] = M[i][t];
                for (let t = 16; t < 64; t++) {
                    W[t] = (S1(W[t - 2]) + W[t - 7] + S0(W[t - 15]) + W[t - 16]) >>> 0;
                }

                let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];

                for (let t = 0; t < 64; t++) {
                    var T1 = h + F1(e) + Ch(e, f, g) + K[t] + W[t];
                    var T2 = F0(a) + Maj(a, b, c);
                    h = g;
                    g = f;
                    f = e;
                    e = (d + T1) >>> 0;
                    d = c;
                    c = b;
                    b = a;
                    a = (T1 + T2) >>> 0;
                }

                H[0] = (H[0] + a) >>> 0;
                H[1] = (H[1] + b) >>> 0;
                H[2] = (H[2] + c) >>> 0;
                H[3] = (H[3] + d) >>> 0;
                H[4] = (H[4] + e) >>> 0;
                H[5] = (H[5] + f) >>> 0;
                H[6] = (H[6] + g) >>> 0;
                H[7] = (H[7] + h) >>> 0;
            }

            for (var h = 0; h < H.length; h++) H[h] = ('00000000' + H[h].toString(16)).slice(-8);

            return H.join('');
        };
    }());

    /**
     * Build a Merkle branch.
     * @param {Hash} left
     * @param {Hash} right
     * @param {HashFunction} [hash_f]
     * @constructor
     */
    function MerkleBranch(left, right, hash_f) {
        /**
         * @type {function(String): Hash}
         */
        var _hash_f = hash_f || sha256;
        /***
         * @type {Hash}
         */
        var _left = left;
        /**
         * @type {Hash}
         */
        var _right = right;
        /**
         * @type {Hash}
         */
        var _parent = _hash_f(_left + _right);

        /**
         * Get the parent of the branch.
         * @returns {Hash}
         */
        this.get_parent = function () {
            return _parent;
        };

        /**
         * Check if a branch contains a hash.
         * @param {Hash} target
         * @returns {boolean}
         */
        this.contains = function (target) {
            return _left == target || _right == target;
        };

        /**
         * @returns {{parent: Hash, left: Hash, right: Hash}}
         */
        this.get_json = function () {
            return {
                "parent": _parent,
                "left": _left,
                "right": _right
            }
        };
    }

    /**
     * Builds a Merkle proof.
     * @param {String} target
     * @param {Function} [hash_f]
     * @constructor
     */
    function MerkleProof(target, hash_f) {
        var self = this;

        //noinspection JSUnusedGlobalSymbols
        this.hash_f = hash_f || sha256;
        this.branches = [];
        this.target = target;

        /**
         * Add a branch to the proof.
         * @param {MerkleBranch} branch
         */
        this.add = function (branch) {
            self.branches.push(branch);
        };

        /**
         * Returns the root string if proof is valid, false if it's not
         * @returns {String|Boolean}
         */
        this.is_valid = function () {
            // Check if the target hash is in the proof.

            // We assume that the leaf is contained in the
            // first branch of the proof, so then we check
            // if the parent is contained in each higher
            // branch.

            var new_target = self.target;

            if (!self.branches.length) return false;

            for (var i = 0, branch; i < self.branches.length; i++) {
                branch = self.branches[i];
                if (!(branch.contains(new_target))) {
                    return false;
                }
                new_target = branch.get_parent();
            }

            return new_target;
        };

        // MerkleProof to machine readable JSON.
        this.get_json = function () {
            var json_data = [];
            self.branches.forEach(function (branch) {
                json_data.push(branch.get_json());
            });
            return (json_data);
        };
    }

    var api = woleet || {};
    api.receipt = api.receipt || {};

    /**
     * Validate a receipt.
     * @param {Receipt} receipt
     * @returns {Boolean} true if the receipt is valid
     */
    api.receipt.validate = function (receipt) {

        if (!receipt || !receipt.target || !receipt.target.target_hash || !receipt.target.target_proof
            || !(receipt.target.target_proof instanceof Array) || !receipt.header || !receipt.header.hash_type
            || !receipt.header.merkle_root || !receipt.header.tx_id) {
            throw new Error("invalid_receipt_format");
        }

        for (var i = 0; i < receipt.target.target_proof.length; i++) {
            var branch = receipt.target.target_proof[i];
            if (!branch.left || !branch.right || !branch.parent) {
                throw new Error("invalid_target_proof");
            }
            if (!api.isSHA256(branch.left) || !api.isSHA256(branch.right) || !api.isSHA256(branch.parent)) {
                throw new Error("non_sha256_target_proof_element");
            }
        }

        // If no Merkle proof
        if (receipt.target.target_proof.length == 0) {
            // Receipt is valid if target hash is Merkle root
            if (receipt.target.target_hash == receipt.header.merkle_root) return true;
            else throw new Error("merkle_root_mismatch");
        }

        // If there is a Merkle proof
        else {

            // Build the Merkle proof while checking its integrity
            var proof = new MerkleProof(receipt.target.target_hash);
            receipt.target.target_proof.forEach(function (branch) {

                // Build a new Merkle branch
                var merkleBranch = new MerkleBranch(branch.left, branch.right);

                // Check that provided parent is correctly computed
                if (!merkleBranch.get_parent() == branch.parent) {
                    throw new Error("invalid_parent_in_proof_element");
                }

                // Add Merkle branch to the Merkle proof
                proof.add(merkleBranch);
            });

            // Receipt is valid if Merkle proof root is  Merkle root
            if (proof.is_valid() == receipt.header.merkle_root) return true;
            else throw new Error("merkle_root_mismatch");
        }
    };

    return api;
});

