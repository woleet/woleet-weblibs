;(function (root, factory) {
    root.woleet = factory(root.woleet)
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

        return hashStringOrFile(file, progressCallback)

        // We get the hash, so now we get the corresponding anchor ids
            .then(function (hash) {
                return api.anchor.getAnchorIDs(hash);
            })

            // We got ids (an array), for each of them, we get the corresponding receipts
            .then(function (anchorIDsPage) {
                var receiptArray = [];
                return anchorIDsPage.content.reduce(function (chain, anchorId) {
                    return chain.then(function () {
                        return api.receipt.get(anchorId).then(function (receipt) {
                            return receiptArray.push(receipt)
                        }, function (error) {
                            // if we cannot get the corresponding receipt for
                            // this anchorID because it's not yet processed (202)
                            // we ignore this element, else we forward error
                            if (error.code != 202) throw error;
                        })
                    })
                }, Promise.resolve())

                // We got a receipt array, so we forward it
                    .then(function () {
                        // if we had a match but can't get a receipt
                        if (!receiptArray.length && anchorIDsPage.content.length) {
                            throw new Error('file_matched_but_anchor_not_yet_processed')
                        }

                        return receiptArray;
                    });

            })

            .then(function (receiptArray) {

                // We check each receipt we got
                var receiptsCheckOk = receiptArray.map(function (receipt) {
                    try {
                        return api.receipt.validate(receipt);
                    } catch (err) {
                        return false;
                    }
                });

                // We check that all of them are correct
                var receiptsOk = receiptsCheckOk.every(function (e) {
                    return e == true
                });

                var finalArray = [];

                // If so, we get the corresponding transaction
                if (receiptsOk) {
                    return receiptArray.reduce(function (chain, receipt) {
                        return chain.then(function () {
                            return api.transaction.get(receipt.header.tx_id).then(function (tx) {
                                finalArray.push({
                                    receipt: receipt,
                                    confirmations: tx.confirmations,
                                    date: tx.confirmedOn
                                })
                            })
                        })
                    }, Promise.resolve())

                    // We got a array of object with the {receipt, transactionDate}, so we forward it
                        .then(function () {
                            return finalArray;
                        })
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

        return hashStringOrFile(file, progressCallback).then(function (hash) {

            api.receipt.validate(receipt);

            if (receipt.target.target_hash != hash) throw new Error("target_hash_mismatch");

            return api.transaction.get(receipt.header.tx_id)
                .then(function (tx) {
                    return tx;
                }, function (error) {
                    if (error.message == 'tx_not_found') {
                        throw error;
                    }
                    else {
                        throw new Error("error_while_getting_transaction")
                    }
                })
        })

            .then(function (tx) {

                if (tx.opReturn == receipt.header.merkle_root)
                    return {
                        receipt: receipt,
                        confirmations: tx.confirmations,
                        confirmedOn: tx.confirmedOn
                    }; // opReturn matches root
                else
                    throw new Error('opReturn_mismatches_merkleRoot')

            })
    };

    /**
     * @param {File|String} file
     * @param {Function} [progressCallback]
     * @returns {Promise<Hash>}
     */
    var hashStringOrFile = function hashStringOrFile(file, progressCallback) {
        var resolveHash;
        var rejectHash;
        var hashPromise = new Promise(function (resolve, reject) {
            resolveHash = resolve;
            rejectHash = reject;
        });

        if (file instanceof File) {

            if (!api.file || !api.file.Hasher) throw new Error("missing_woleet_hash_dependency");

            var hasher = new api.file.Hasher;
            //noinspection JSUnusedLocalSymbols
            hasher.on('result', function (message, file) {
                resolveHash(message.result);
                if (progressCallback) progressCallback({progress: 1.0, file: File})
            });

            if (progressCallback && typeof progressCallback == 'function') {
                hasher.on('progress', progressCallback);
            }

            hasher.on('error', function (error) {
                rejectHash(error);
            });

            hasher.start(file)
        }
        else if (typeof file == "string") {
            if (api.isSHA256(file)) {
                //noinspection JSUnusedAssignment
                resolveHash(file);
            }
            else {
                //noinspection JSUnusedAssignment
                rejectHash(new Error("parameter_string_not_a_sha256_hash"));
            }
        }
        else {
            //noinspection JSUnusedAssignment
            rejectHash(new Error("invalid_parameter"));
        }

        return hashPromise;
    };

    return api;
});