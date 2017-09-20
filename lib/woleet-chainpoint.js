/**
 * @typedef {Object}   Leaf
 * @typedef {Hash}     Leaf.left
 * @typedef {Hash}     Leaf.right
 * @typedef {Hash}     Leaf.parent
 */

/**
 * @typedef {String} Hash
 */

/**
 * @typedef {function(String): Hash} HashFunction
 */

;(function (factory) {
    if (typeof window !== 'undefined') {
        const root = window;
        module.exports = factory(root.woleet);
    } else {
        module.exports = factory;
    }
})(function (woleet = {}) {

    woleet = Object.assign({receipt: {}}, woleet);

    const isHex = (len) => {
        const reg = new RegExp('^[a-f0-9]{' + len + '}$', 'i');
        return (hash) => reg.test(hash);
    };

    /**
     * @param {Hash} hash
     * @returns {boolean}
     */
    const isSHA256 = isHex(64);
    const sha224 = woleet.crypto.sha224;
    const sha256 = woleet.crypto.sha256;
    const sha384 = woleet.crypto.sha384;
    const sha512 = woleet.crypto.sha512;

    /**
     * Build a Merkle branch.
     * @param {Hash} left
     * @param {Hash} right
     * @param {Function} hashFunction
     * @constructor
     */
    function MerkleBranch(left, right, hashFunction) {

        const _hash = hashFunction || sha256;

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
        const _parent = (_hash().update(_left + _right).digest('hex'));

        /**
         * Get the parent of the branch.
         * @returns {Hash}
         */
        this.getParent = function () {
            return _parent;
        };

        /**
         * Check if a branch contains a hash.
         * @param {Hash} target
         * @returns {boolean}
         */
        this.contains = function (target) {
            return _left === target || _right === target;
        };

        /**
         * @returns {{parent: Hash, left: Hash, right: Hash}}
         */
        this.getJSON = function () {
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
     * @constructor
     */
    function MerkleProof(target) {
        const self = this;

        this.branches = [];
        this.target = target;

        /**
         * Add a branch to the proof.
         * @param {MerkleBranch} branch
         */
        this.add = (branch) => {
            self.branches.push(branch);
        };

        /**
         * Returns the Merkle proof root if the proof is valid, false if it's not
         * @param {Hash} root
         * @returns {String|Boolean}
         */
        this.is_valid = function (root) {

            // Check if the target hash is in the proof (we assume that the leaf is contained in the
            // first branch of the proof) and if the parent of each branch is contained in its higher branch.

            let new_target = self.target;

            if (!self.branches.length) return false;

            for (let i = 0, branch; i < self.branches.length; i++) {
                branch = self.branches[i];
                if (!(branch.contains(new_target))) {
                    return false;
                }
                new_target = branch.getParent();
            }

            return new_target === root;
        };

        // MerkleProof to machine readable JSON.
        this.getJSON = () => self.branches.map((branch) => branch.getJSON());
    }

    function hasAllProperties(obj, ...props) {
        for (let prop of props) {
            if (prop instanceof Array) {
                if (!obj.hasOwnProperty(prop[0])) return false;
                else if (typeof prop[1] === 'string') {
                    if (!(typeof obj[prop[0]] === prop[1])) return false;
                } else {
                    if (!(obj[prop[0]] instanceof prop[1])) return false;
                }
            } else {
                if (!obj.hasOwnProperty(prop) || typeof obj[prop] !== 'string') {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Validate a Chainpoint v1.x receipt.
     * @param {Receipt} receipt
     * @private
     * @returns {Boolean} true if the receipt is valid
     */
    function _validateChainpoint1Receipt(receipt) {

        if (!hasAllProperties(receipt, ['header', 'object'], ['target', 'object']))
            throw new Error("invalid_receipt_format");

        if (!hasAllProperties(receipt.header, 'chainpoint_version', 'hash_type', 'merkle_root', 'tx_id', ['timestamp', 'number']))
            throw new Error("invalid_receipt_format");

        if (!hasAllProperties(receipt.target, 'target_hash', ['target_proof', Array]))
            throw new Error("invalid_receipt_format");

        if (!receipt.target.target_proof.every((branch) => hasAllProperties(branch, 'left', 'right', 'parent')))
            throw new Error("invalid_target_proof");

        if (!receipt.target.target_proof.every((branch) => isSHA256(branch.left) && isSHA256(branch.right) && isSHA256(branch.parent)))
            throw new Error("non_sha256_target_proof_element");

        // If no Merkle proof
        if (receipt.target.target_proof.length === 0) {
            // Receipt is valid if its target hash is equal to its Merkle root
            if (receipt.target.target_hash === receipt.header.merkle_root) return true;
            else throw new Error("merkle_root_mismatch");
        }

        // If there is a Merkle proof
        else {

            // Build the Merkle proof while checking its integrity
            const proof = new MerkleProof(receipt.target.target_hash);
            receipt.target.target_proof.forEach((branch) => {

                // Build a new Merkle branch
                const merkleBranch = new MerkleBranch(branch.left, branch.right, sha256);

                // Check that provided parent is correctly computed
                if (merkleBranch.getParent() !== branch.parent) {
                    throw new Error("invalid_parent_in_proof_element");
                }

                // Add Merkle branch to the Merkle proof
                proof.add(merkleBranch);
            });

            // Receipt is valid if its Merkle root is equal to the Merkle proof root
            if (proof.is_valid(receipt.header.merkle_root)) return true;
            else throw new Error("merkle_root_mismatch");
        }
    }

    /**
     * Validate a Chainpoint v2 receipt.
     * @param {ReceiptV2} receipt
     * @private
     * @returns {Boolean} true if the receipt is valid
     */
    function _validateChainpoint2Receipt(receipt) {
        if (!hasAllProperties(receipt, '@context', 'type', 'targetHash', 'merkleRoot', ['proof', Array], ['anchors', Array])) {
            console.log(receipt);
            throw new Error("invalid_receipt_format");
        }

        let shaX = null;
        let validateHex = null;
        switch (receipt.type) {
            case "ChainpointSHA224v2":
                shaX = sha224;
                validateHex = isHex(56);
                break;
            case "ChainpointSHA256v2":
                shaX = sha256;
                validateHex = isHex(64);
                break;
            case "ChainpointSHA384v2":
                shaX = sha384;
                validateHex = isHex(96);
                break;
            case "ChainpointSHA512v2":
                shaX = sha512;
                validateHex = isHex(128);
                break;
            case "ChainpointSHA3-224v2":
            case "ChainpointSHA3-256v2":
            case "ChainpointSHA3-384v2":
            case "ChainpointSHA3-512v2":
                throw new Error("unsupported_algorithm");
            default:
                throw new Error("invalid_type");
        }

        const XOR = (a, b) => a ? !b : b;

        if (!receipt.proof.every((branch) => XOR(branch.hasOwnProperty('left'), branch.hasOwnProperty('right'))))
            throw new Error("invalid_target_proof");

        if (!receipt.proof.every((branch) => validateHex(branch.left || branch.right)))
            throw new Error("non_sha256_target_proof_element");

        // If no Merkle proof
        if (receipt.proof.length === 0) {
            // Receipt is valid if its target hash is equal to its Merkle root
            if (receipt.targetHash === receipt.merkleRoot) return true;
            else throw new Error("merkle_root_mismatch");
        }

        // If there is a Merkle proof
        else {

            // Build the Merkle proof while checking its integrity
            const proof = new MerkleProof(receipt.targetHash);
            let target = receipt.targetHash;
            receipt.proof.forEach((branch) => {
                let left, right;
                // Build a new Merkle branch
                if (branch.left) {
                    left = branch.left;
                    right = target;
                } else {
                    left = target;
                    right = branch.right;
                }

                let merkleBranch = new MerkleBranch(left, right, shaX);

                target = merkleBranch.getParent();

                // Add Merkle branch to the Merkle proof
                proof.add(merkleBranch);
            });

            // Receipt is valid if its Merkle root is equal to the Merkle proof root
            if (proof.is_valid(receipt.merkleRoot)) return true;
            else throw new Error("merkle_root_mismatch");
        }
    }

    /**
     * Validate a receipt.
     * @param {Receipt} receipt
     * @returns {Boolean} true if the receipt is valid
     */
    function validateReceipt(receipt) {
        if (!receipt || typeof receipt !== 'object')
            throw new Error("invalid_receipt_format");

        if (receipt.hasOwnProperty('header')) {
            return _validateChainpoint1Receipt(receipt);
        } else {
            return _validateChainpoint2Receipt(receipt);
        }
    }

    woleet.receipt.validate = validateReceipt;

    return woleet.receipt.validate;
})
;

