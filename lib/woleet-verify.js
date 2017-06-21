;(function (factory) {
    const root = typeof window !== 'undefined' ? window : {woleet: {}};
    return module.exports = factory(root.woleet, root);
})(function (woleet = {}) {

    /**
     * @param {Proof} result
     * @private
     * @description utility function that extends checks for signature validity
     * @return {Promise.<Proof>}
     */
    function validateSignature(result) {
        return Promise.resolve(result)
            .then((result) => {
                if (result.receipt.signature) {
                    const s = result.receipt.signature;

                    return Promise.resolve(result)
                        .then((result) => {
                            return woleet.signature.validateSignature(s.signedHash, s.pubKey, s.signature)
                                .then((validation) => {
                                    if (!validation.valid) throw new Error('invalid_receipt_signature');
                                    else return result;
                                })
                        })
                        .then((result) => {
                            if (s.identityURL) return woleet.signature.validateIdentity(s.identityURL, s.pubKey)
                                .then((validation) => {
                                    if (!validation.valid) throw new Error('identity_verification_failed');
                                    else return result;
                                });
                            else return result;
                        });

                } else {
                    return result;
                }
            })
    }

    /**
     * @param {File|String} file
     * @param {Function} [progressCallback]
     * @returns {Promise.<Proof[]>}
     */
    function WoleetDAB(file, progressCallback) {

        return woleet.file.hashFileOrCheckHash(file, progressCallback)

        // We got the hash, now we get all corresponding public anchors ids
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

                ////// Forward the receipt array
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
                    .map((receipt) => {
                        try {
                            // Validate the receipt
                            woleet.receipt.validate(receipt);
                            /** @type Receipt */
                            return receipt;
                        } catch (err) {
                            /** @type ProofError */
                            return {error: err.message};
                        }
                    })

                    // Build the result array
                    .reduce(
                        /**
                         * @param {Promise} chain
                         * @param {ProofError|Receipt} result
                         */
                        (chain, result) => {
                            return chain.then(() => {
                                if (result.error) {
                                    // If the validation previously failed we just forward the error code
                                    return result;
                                }

                                // Get the corresponding transaction
                                return woleet.transaction
                                    .get(result.header.tx_id)
                                    .then((tx) => {
                                        // Check that receipt's Merkle root matches transaction's OP_RETURN
                                        if (tx.opReturn === result.header.merkle_root) {
                                            //noinspection JSCheckFunctionSignatures
                                            return validateSignature({
                                                receipt: result,
                                                confirmations: tx.confirmations,
                                                timestamp: tx.timestamp
                                            })
                                                .then((validation) => finalArray.push(validation))
                                                .catch((err) => ({error: err.message}));
                                        }
                                        else
                                            return {error: 'op_return_mismatches_merkle_root'}
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
     * @returns {Promise<Proof>}
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
                        if (error.message === 'tx_not_found') {
                            throw error;
                        }
                        else {
                            throw new Error("error_while_getting_transaction");
                        }
                    })
            })

            // We got the transaction
            .then((tx) => {

                // Check that receipt's Merkle root matches transaction's OP_RETURN
                if (tx.opReturn === receipt.header.merkle_root) {

                    // Return the result
                    return {
                        receipt: receipt,
                        confirmations: tx.confirmations,
                        timestamp: tx.timestamp
                    };
                }
                else
                    throw new Error('op_return_mismatches_merkle_root')
            })
            .then(validateSignature)
            .catch((error) => ({error: error.message}))
    }

    return woleet.verify = Object.assign({WoleetDAB, DAB}, woleet.verify);
});