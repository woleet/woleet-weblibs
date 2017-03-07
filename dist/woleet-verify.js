'use strict';

;(function (root, factory) {
    root.woleet = factory(root.woleet);
})(window, function (woleet) {

    var api = woleet || {};
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
        .then(function (hash) {
            return api.anchor.getAnchorIDs(hash);
        })

        // We got public anchors ids (as an array)
        .then(function (anchorIDsPage) {

            // For each public anchor, get the corresponding receipt
            var receiptArray = [];
            return anchorIDsPage.content.reduce(function (chain, anchorId) {
                return chain.then(function () {
                    return api.receipt.get(anchorId).then(function (receipt) {
                        return receiptArray.push(receipt);
                    }).catch(function (error) {
                        // If we cannot get the corresponding receipt for
                        // this anchorID because it's not yet processed (202)
                        // we ignore this element, else we forward error
                        if (error.code != 202) throw error;
                    });
                });
            }, Promise.resolve())

            // Forward the receipt array
            .then(function () {
                // If we had a match but can't get a receipt
                if (!receiptArray.length && anchorIDsPage.content.length) {
                    throw new Error('file_matched_but_anchor_not_yet_processed');
                }

                return receiptArray;
            });
        })

        // We got all public anchor receipts
        .then(function (receiptArray) {

            // For each receipt we got
            var receiptsCheckOk = receiptArray.map(function (receipt) {
                try {
                    // Validate the receipt
                    api.receipt.validate(receipt);
                    return true;
                } catch (err) {
                    return false;
                }
            });

            // If all receipts are validated
            var receiptsOk = receiptsCheckOk.every(function (e) {
                return e == true;
            });
            if (receiptsOk) {

                // Build the result array
                var finalArray = [];
                return receiptArray.reduce(function (chain, receipt) {
                    return chain.then(function () {

                        // Get the corresponding transaction
                        return api.transaction.get(receipt.header.tx_id).then(function (tx) {

                            // Check that receipt's Merkle root matches transaction's OP_RETURN
                            if (tx.opReturn == receipt.header.merkle_root) {
                                finalArray.push({
                                    receipt: receipt,
                                    confirmations: tx.confirmations,
                                    confirmedOn: tx.confirmedOn
                                });
                            } else throw new Error('opReturn_mismatches_merkleRoot');
                        });
                    });
                }, Promise.resolve())

                // We got an array of object with {receipt, confirmations, confirmedOn}, so we forward it
                .then(function () {
                    return finalArray;
                });
            } else {
                throw new Error("invalid_receipt");
            }
        });
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
        .then(function (hash) {

            // Validate the receipt
            api.receipt.validate(receipt);

            // Check that receipt's target hash matches the hash
            if (receipt.target.target_hash != hash) throw new Error("target_hash_mismatch");

            // Get the transaction
            return api.transaction.get(receipt.header.tx_id).catch(function (error) {
                if (error.message == 'tx_not_found') {
                    throw error;
                } else {
                    // We try a second time with a different provider
                    api.transaction.setDefaultProvider('blockcypher.com');
                    return api.transaction.get(receipt.header.tx_id);
                }
            }).catch(function (error) {
                if (error.message == 'tx_not_found') {
                    throw error;
                } else {
                    throw new Error("error_while_getting_transaction");
                }
            });
        })

        // We got the transaction
        .then(function (tx) {

            // Check that receipt's Merkle root matches transaction's OP_RETURN
            if (tx.opReturn == receipt.header.merkle_root)

                // Return the result
                return {
                    receipt: receipt,
                    confirmations: tx.confirmations,
                    confirmedOn: tx.confirmedOn
                };else throw new Error('opReturn_mismatches_merkleRoot');
        });
    };

    return api;
});