;(function (factory) {
    const root = typeof window !== 'undefined' ? window : {woleet: {}};
    return module.exports = factory(root.woleet, root);
})(function (woleet = {}) {

    /**
     * @param {ReceiptVerificationStatus} verification
     * @private
     * @description utility function that extends checks for signature validity
     * @return {Promise.<ReceiptVerificationStatus>}
     */
    function validateSignature(verification) {
        return Promise.resolve(verification)
            .then((result) => {
                if (result.receipt.signature) {
                    const s = result.receipt.signature;

                    if (!s.signature || !s.signedHash || !s.pubKey)
                        throw new Error('invalid_receipt_signature_format');

                    return Promise.resolve(result)
                        .then((result) => {
                            return woleet.signature.validateSignature(s.signedHash, s.pubKey, s.signature)
                                .then(({valid}) => {
                                    if (!valid) {
                                        return {receipt: verification.receipt, code: 'invalid_receipt_signature'}
                                    }

                                    return result;
                                })
                        })
                        .then((result) => {
                            if (s.identityURL) return woleet.signature.validateIdentity(s.identityURL, s.pubKey)
                                .then(({valid}) => {
                                    if (!valid) {
                                        result.identityVerificationStatus = {
                                            code: 'identity_verification_failed'
                                        }
                                    } else {
                                        result.identityVerificationStatus = {
                                            code: 'verified'
                                        }
                                    }
                                })
                                .catch(({message: code}) => {
                                    result.identityVerificationStatus = {code};
                                })
                                .then(() =>  result);
                            else return result;
                        });

                } else {
                    return result;
                }
            })
    }

    /**
     * @param {Receipt} receipt
     * @return {Promise.<ReceiptVerificationStatus>}
     */
    function getReceiptInformation(receipt) {
        // Get the transaction
        return woleet.transaction.get(receipt.header.tx_id)
            .catch((error) => {
                if (error.message === 'tx_not_found') {
                    throw error;
                }
                else {
                    // We try a second time with a different provider
                    woleet.transaction.setDefaultProvider('blockcypher.com');
                    return woleet.transaction.get(receipt.header.tx_id);
                }
            })
            .catch((error) => {
                throw error;
            })
            // We got the transaction
            .then((tx) => {
                // Check that receipt's Merkle root matches transaction's OP_RETURN
                if (tx.opReturn === receipt.header.merkle_root) {
                    // Return the result
                    return {
                        receipt: receipt,
                        confirmations: tx.confirmations,
                        timestamp: tx.timestamp,
                        code: 'verified'
                    };
                }
                else
                    throw new Error('op_return_mismatches_merkle_root')
            })
    }

    /**
     * @param {File|String} file
     * @param {Function} [progressCallback]
     * @returns {Promise.<ReceiptVerificationStatus[]>}
     */
    function WoleetDAB(file, progressCallback) {
        return woleet.file.hashFileOrCheckHash(file, progressCallback)
        //  //We got the hash, now we get all corresponding public anchors ids
            .then((hash) => woleet.anchor.getAnchorIDs(hash, woleet.anchor.types.BOTH))
            // We got public anchors ids (as an array)
            .then((anchorIDs) => {
                // For each public anchor, get the corresponding receipt
                const receiptArray = [];
                return anchorIDs.reduce((chain, anchorId) => chain
                    .then(() => woleet.receipt.get(anchorId))
                    .then((receipt) => receiptArray.push(receipt))
                    .catch((error) => {
                        // If we cannot get the corresponding receipt for
                        // this anchorID because it's not yet processed (202)
                        // we ignore this element, else we forward error
                        if (error.code !== 202) throw error;
                    }), Promise.resolve())
                //  // Forward the receipt array
                    .then(() => {
                        // If we had a match but can't get a receipt
                        if (!receiptArray.length && anchorIDs.length) {
                            throw new Error('file_matched_but_anchor_not_yet_processed')
                        }
                        /** @type Receipt[] */
                        return receiptArray;
                    });
            })

            // We got all public anchor receipts
            .then((receiptArray) => {
                const finalArray = [];
                // For each receipt we got
                return receiptArray
                // Build the result array
                    .reduce(
                        /**
                         * @param {Promise} chain
                         * @param {Receipt} receipt
                         */
                        (chain, receipt) => {
                            return chain.then(() => {
                                // Get the corresponding transaction
                                return woleet.transaction
                                    .get(receipt.header.tx_id)
                                    .then((tx) => {
                                        const {opReturn, confirmations, timestamp} = tx;

                                        try {
                                            // Validate the receipt
                                            woleet.receipt.validate(receipt);
                                        } catch ({message: code}) {
                                            return {receipt, code};
                                        }

                                        // Check that receipt's Merkle root matches transaction's OP_RETURN
                                        if (opReturn === receipt.header.merkle_root) {
                                            //noinspection JSCheckFunctionSignatures
                                            return validateSignature({
                                                receipt,
                                                confirmations,
                                                timestamp,
                                                code: 'verified'
                                            })
                                                .then((validation) => {
                                                    finalArray.push(validation)
                                                })
                                                .catch(({message: code}) => {
                                                    finalArray.push({receipt, code})
                                                })
                                        }
                                        else
                                            return {receipt, code: 'op_return_mismatches_merkle_root'}
                                    })
                            })
                        }, Promise.resolve())
                    // We got an array of object with {receipt, confirmations, timestamp}, so we forward it
                    .then(() => finalArray)
            })
    }

    /**
     * @param {File|String} file
     * @param {Receipt} receipt
     * @param {Function} [progressCallback]
     * @returns {Promise.<ReceiptVerificationStatus>}
     */
    function DAB(file, receipt, progressCallback) {

        return woleet.file.hashFileOrCheckHash(file, progressCallback)
        //  // We got the hash
            .then((hash) => {
                // Validate the receipt (can throw error that are caught later)
                woleet.receipt.validate(receipt);
                // Check that receipt's target hash matches the hash
                if (receipt.signature) {
                    if (receipt.signature.signedHash !== hash) throw new Error("target_hash_mismatch");
                }
                else {
                    if (receipt.target.target_hash !== hash) throw new Error("target_hash_mismatch");
                }
            })
            .then(() => getReceiptInformation(receipt))
            .then((proof) => validateSignature(proof))
            .catch(({message: code}) => {
                return {receipt, code};
            })
    }

    /**
     * @param {Receipt} receipt
     * @returns {Promise}
     */
    function receipt(receipt) {
        return Promise.resolve()
            .then(() => woleet.receipt.validate(receipt))
            .then(() => getReceiptInformation(receipt))
            .then((proof) => validateSignature(proof))
            .then((proof) => {
                let code;
                if (proof.code) {
                    code = proof.code;
                } else {
                    code = 'verified'
                }
            })
    }

    return woleet.verify = Object.assign({WoleetDAB, DAB, receipt}, woleet.verify);
});