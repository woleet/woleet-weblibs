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

/**
 * @typedef {string} Hash
 */

/**
 * @typedef {function(String): Hash} HashFunction
 */

;(function (factory) {
    const root = typeof window !== 'undefined' ? window : {woleet: {}};
    return module.exports = factory(root.woleet, root);
})(function (woleet = {}) {

    woleet = Object.assign({receipt: {}}, woleet);

    /**
     * @param {Hash} hash
     * @returns {boolean}
     */
    const isSHA256 = (hash) => /^[a-f0-9]{64}$/i.test(hash);
    const sha256 = woleet.crypto.sha256;

    /**
     * Build a Merkle branch.
     * @param {Hash} left
     * @param {Hash} right
     * @constructor
     */
    function MerkleBranch(left, right) {
        /***
         * @type {Hash}
         */
        const _left = left;
        /**
         * @type {Hash}
         */
        const _right = right;
        /**
         * @type {Hash}
         */
        const _parent = (sha256().update(_left + _right).digest('hex'));

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
        const self = this;

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
         * Returns the Merkle proof root if the proof is valid, false if it's not
         * @returns {String|Boolean}
         */
        this.is_valid = function () {

            // Check if the target hash is in the proof (we assume that the leaf is contained in the
            // first branch of the proof) and if the parent of each branch is contained in its higher branch.

            let new_target = self.target;

            if (!self.branches.length) return false;

            for (let i = 0, branch; i < self.branches.length; i++) {
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
            const json_data = [];
            self.branches.forEach(function (branch) {
                json_data.push(branch.get_json());
            });
            return (json_data);
        };
    }

    /**
     * Validate a receipt.
     * @param {Receipt} receipt
     * @returns {Boolean} true if the receipt is valid
     */
    function validateReceipt(receipt) {

        if (!receipt || !receipt.target || !receipt.target.target_hash || !receipt.target.target_proof
            || !(receipt.target.target_proof instanceof Array) || !receipt.header || !receipt.header.hash_type
            || !receipt.header.merkle_root || !receipt.header.tx_id) {
            throw new Error("invalid_receipt_format");
        }

        for (let i = 0; i < receipt.target.target_proof.length; i++) {
            const branch = receipt.target.target_proof[i];
            if (!branch.left || !branch.right || !branch.parent) {
                throw new Error("invalid_target_proof");
            }
            if (!isSHA256(branch.left) || !isSHA256(branch.right) || !isSHA256(branch.parent)) {
                throw new Error("non_sha256_target_proof_element");
            }
        }

        // If no Merkle proof
        if (receipt.target.target_proof.length == 0) {

            // Receipt is valid if its target hash is equal to its Merkle root
            if (receipt.target.target_hash == receipt.header.merkle_root) return true;
            else throw new Error("merkle_root_mismatch");
        }

        // If there is a Merkle proof
        else {

            // Build the Merkle proof while checking its integrity
            const proof = new MerkleProof(receipt.target.target_hash);
            receipt.target.target_proof.forEach((branch) => {

                // Build a new Merkle branch
                const merkleBranch = new MerkleBranch(branch.left, branch.right);

                // Check that provided parent is correctly computed
                if (!merkleBranch.get_parent() == branch.parent) {
                    throw new Error("invalid_parent_in_proof_element");
                }

                // Add Merkle branch to the Merkle proof
                proof.add(merkleBranch);
            });

            // Receipt is valid if its Merkle root is equal to the Merkle proof root
            if (proof.is_valid() == receipt.header.merkle_root) return true;
            else throw new Error("merkle_root_mismatch");
        }
    }

    woleet.receipt.validate = validateReceipt;

    return woleet.receipt.validate;
});

