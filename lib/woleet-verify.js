;(function (root, factory) {
    root.woleet = factory(root.woleet)
})(window, function (woleet) {

    const api = woleet || {};
    api.receipt = api.receipt || {};
    api.anchor = api.anchor || {};
    api.verify = api.verify || {};

    /**
     * @param {File|String} file
     * @param {Function} [progressCallback]
     * @returns {Promise.<Object[]>}
     */
    api.verify.WoleetDAB = function (file, progressCallback) {

        return api.hashFileOrCheckHash(file, progressCallback)

        // We got the hash, now we get all corresponding public anchors ids
            .then((hash) => api.anchor.getAnchorIDs(hash))

            // We got public anchors ids (as an array)
            .then((anchorIDsPage) => {

                // For each public anchor, get the corresponding receipt
                const receiptArray = [];
                return anchorIDsPage.content.reduce((chain, anchorId) => {
                    return chain.then(() => {
                        return api.receipt.get(anchorId)
                            .then((receipt) => receiptArray.push(receipt))
                            .catch((error) => {
                                // If we cannot get the corresponding receipt for
                                // this anchorID because it's not yet processed (202)
                                // we ignore this element, else we forward error
                                if (error.code != 202) throw error;
                            })
                    })
                }, Promise.resolve())

                // Forward the receipt array
                    .then(() => {
                        // If we had a match but can't get a receipt
                        if (!receiptArray.length && anchorIDsPage.content.length) {
                            throw new Error('file_matched_but_anchor_not_yet_processed')
                        }

                        return receiptArray;
                    });
            })

            // We got all public anchor receipts
            .then((receiptArray) => {

                // For each receipt we got
                const receiptsCheckOk = receiptArray.map((receipt) => {
                    try {
                        // Validate the receipt
                        api.receipt.validate(receipt);
                        return true;
                    } catch (err) {
                        return false;
                    }
                });

                // If all receipts are validated
                const receiptsOk = receiptsCheckOk.every((e) => e == true);
                if (receiptsOk) {

                    // Build the result array
                    const finalArray = [];
                    return receiptArray.reduce((chain, receipt) => {
                        return chain.then(() => {

                            // Get the corresponding transaction
                            return api.transaction.get(receipt.header.tx_id).then((tx) => {

                                // Check that receipt's Merkle root matches transaction's OP_RETURN
                                if (tx.opReturn == receipt.header.merkle_root) {
                                    finalArray.push({
                                        receipt: receipt,
                                        confirmations: tx.confirmations,
                                        confirmedOn: tx.confirmedOn
                                    });
                                }
                                else
                                    throw new Error('opReturn_mismatches_merkleRoot')
                            })
                        })
                    }, Promise.resolve())

                    // We got an array of object with {receipt, confirmations, confirmedOn}, so we forward it
                        .then(() => finalArray)
                }
                else {
                    throw new Error("invalid_receipt");
                }
            })
    };

    /**
     * @param {File|String} file
     * @param {Receipt} receipt
     * @param {Function} [progressCallback]
     * @returns {Promise<Object>}
     */
    api.verify.DAB = function (file, receipt, progressCallback) {

        return api.hashFileOrCheckHash(file, progressCallback)

        // We got the hash
            .then((hash) => {

                // Validate the receipt
                api.receipt.validate(receipt);

                // Check that receipt's target hash matches the hash
                if (receipt.target.target_hash != hash) throw new Error("target_hash_mismatch");

                // Get the transaction
                return api.transaction.get(receipt.header.tx_id)
                    .catch((error) => {
                        if (error.message == 'tx_not_found') {
                            throw error;
                        }
                        else {
                            // We try a second time with a different provider
                            api.transaction.setDefaultProvider('blockcypher.com');
                            return api.transaction.get(receipt.header.tx_id);
                        }
                    })
                    .catch((error) => {
                        if (error.message == 'tx_not_found') {
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
                if (tx.opReturn == receipt.header.merkle_root)

                // Return the result
                    return {
                        receipt: receipt,
                        confirmations: tx.confirmations,
                        confirmedOn: tx.confirmedOn
                    };
                else
                    throw new Error('opReturn_mismatches_merkleRoot')
            })
    };

    return api;
});