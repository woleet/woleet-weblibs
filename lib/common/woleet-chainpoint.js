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
 * @typedef {{left:Hash, right:Hash, parent:Hash}} MerkleBranch
 */

/**
 * @typedef {function(String): Hash} HashFunction
 */

module.exports = function (crypto) {

  const INVALID_RECEIPT_FORMAT = 'invalid_receipt_format',
    INVALID_TARGET_PROOF = 'invalid_target_proof',
    INVALID_TYPE = 'invalid_type',
    NON_SHA256_TARGET_PROOF_ELEMENT = 'non_sha256_target_proof_element',
    MERKLE_ROOT_MISMATCH = 'merkle_root_mismatch',
    INVALID_PARENT_IN_PROOF_ELEMENT = 'invalid_parent_in_proof_element',
    UNSUPPORTED_ALGORITHM = 'unsupported_algorithm';

  const isHex = (len) => {
    const reg = new RegExp('^[a-f0-9]{' + len + '}$', 'i');
    return (hash) => reg.test(hash);
  };

  /**
   * @param {Hash} hash
   * @returns {boolean}
   */
  const isSHA256 = isHex(64);
  const sha224 = crypto.sha224;
  const sha256 = crypto.sha256;
  const sha384 = crypto.sha384;
  const sha512 = crypto.sha512;

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

      let target = self.target;

      if (!self.branches.length) return false;

      for (let i = 0, branch; i < self.branches.length; i++) {
        branch = self.branches[i];
        if (!(target === branch.left || target === branch.right)) {
          return false;
        }
        target = branch.parent;
      }

      return target.toLowerCase() === root.toLowerCase();
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
      throw new Error(INVALID_RECEIPT_FORMAT);

    if (!hasAllProperties(receipt.header, 'chainpoint_version', 'hash_type', 'merkle_root', 'tx_id', ['timestamp', 'number']))
      throw new Error(INVALID_RECEIPT_FORMAT);

    if (!hasAllProperties(receipt.target, 'target_hash', ['target_proof', Array]))
      throw new Error(INVALID_RECEIPT_FORMAT);

    if (!receipt.target.target_proof.every((branch) => hasAllProperties(branch, 'left', 'right', 'parent')))
      throw new Error(INVALID_TARGET_PROOF);

    if (!receipt.target.target_proof.every((branch) => isSHA256(branch.left) && isSHA256(branch.right) && isSHA256(branch.parent)))
      throw new Error(NON_SHA256_TARGET_PROOF_ELEMENT);

    // If no Merkle proof
    if (receipt.target.target_proof.length === 0) {
      // Receipt is valid if its target hash is equal to its Merkle root
      if (receipt.target.target_hash.toLowerCase() === receipt.header.merkle_root.toLowerCase()) return true;
      else throw new Error(MERKLE_ROOT_MISMATCH);
    }

    // If there is a Merkle proof
    else {

      // Build the Merkle proof while checking its integrity
      const proof = new MerkleProof(receipt.target.target_hash);
      receipt.target.target_proof.forEach((branch) => {

        // Build a new Merkle branch
        const parent = (sha256().update(branch.left + branch.right, 'utf8').digest('hex'));

        // Check that provided parent is correctly computed
        if (parent !== branch.parent) {
          throw new Error(INVALID_PARENT_IN_PROOF_ELEMENT);
        }

        // Add Merkle branch to the Merkle proof
        proof.add({ left: branch.left, right: branch.right, parent });
      });

      // Receipt is valid if its Merkle root is equal to the Merkle proof root
      if (proof.is_valid(receipt.header.merkle_root)) return true;
      else throw new Error(MERKLE_ROOT_MISMATCH);
    }
  }

  /**
   * Validate a Chainpoint v2 receipt.
   * @param {ReceiptV2} receipt
   * @private
   * @returns {Boolean} true if the receipt is valid
   */
  function _validateChainpoint2Receipt(receipt) {

    if (!hasAllProperties(receipt, 'targetHash', 'merkleRoot', ['proof', Array], ['anchors', Array])) {
      throw new Error(INVALID_RECEIPT_FORMAT);
    }

    if (!(receipt.hasOwnProperty('@context') || receipt.hasOwnProperty('context') && receipt.hasOwnProperty('@type') || receipt.hasOwnProperty('type'))) {
      throw new Error(INVALID_RECEIPT_FORMAT);
    }

    const type = receipt.type || receipt['@type'];

    if (typeof type !== 'string' || !/^ChainpointSHA([0-9]-)?[0-9]{3}v2$/.test(type)) {
      throw new Error(INVALID_RECEIPT_FORMAT);
    }

    let shaX = null;
    let validateHex = null;
    switch (type) {
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
        throw new Error(UNSUPPORTED_ALGORITHM);
      default:
        throw new Error(INVALID_TYPE);
    }

    const xor = (a, b) => a ? !b : b;

    if (!receipt.proof.every((branch) => xor(branch.hasOwnProperty('left'), branch.hasOwnProperty('right'))))
      throw new Error(INVALID_TARGET_PROOF);

    if (!receipt.proof.every((branch) => validateHex(branch.left || branch.right)))
      throw new Error(NON_SHA256_TARGET_PROOF_ELEMENT);

    // If no Merkle proof
    if (receipt.proof.length === 0) {
      // Receipt is valid if its target hash is equal to its Merkle root
      if (receipt.targetHash.toLowerCase() === receipt.merkleRoot.toLowerCase()) return true;
      else throw new Error(MERKLE_ROOT_MISMATCH);
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

        const parent = (shaX().update(left + right, 'hex').digest('hex'));

        target = parent;

        // Add Merkle branch to the Merkle proof
        proof.add({ left, right, parent });
      });

      // Receipt is valid if its Merkle root is equal to the Merkle proof root
      if (proof.is_valid(receipt.merkleRoot)) return true;
      else throw new Error(MERKLE_ROOT_MISMATCH);
    }
  }

  /**
   * Validate a receipt.
   * @param {Receipt|ReceiptV2} receipt
   * @returns {Boolean} true if the receipt is valid
   */
  function validateReceipt(receipt) {
    if (!receipt || typeof receipt !== 'object')
      throw new Error(INVALID_RECEIPT_FORMAT);

    if (receipt.hasOwnProperty('header')) {
      return _validateChainpoint1Receipt(receipt);
    } else {
      return _validateChainpoint2Receipt(receipt);
    }
  }

  return validateReceipt;
};

