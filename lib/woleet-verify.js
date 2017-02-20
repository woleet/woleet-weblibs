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

        return hashStringOrFile(file, progressCallback)

        // We get the hash, so now we get the corresponding anchor ids
            .then((hash) => api.anchor.getAnchorIDs(hash))

            // We got ids (an array), for each of them, we get the corresponding receipts
            .then((anchorIDsPage) => {
                const receiptArray = [];
                return anchorIDsPage.content.reduce((chain, anchorId) => {
                    return chain.then(() => {
                        return api.receipt.get(anchorId)
                            .then((receipt) => receiptArray.push(receipt))
                            .catch((error) => {
                                // if we cannot get the corresponding receipt for
                                // this anchorID because it's not yet processed (202)
                                // we ignore this element, else we forward error
                                if (error.code != 202) throw error;
                            })
                    })
                }, Promise.resolve())

                // We got a receipt array, so we forward it
                    .then(() => {
                        // if we had a match but can't get a receipt
                        if (!receiptArray.length && anchorIDsPage.content.length) {
                            throw new Error('file_matched_but_anchor_not_yet_processed')
                        }

                        return receiptArray;
                    });

            })

            .then((receiptArray) => {

                // We check each receipt we got
                const receiptsCheckOk = receiptArray.map((receipt) => {
                    try {
                        return api.receipt.validate(receipt);
                    } catch (err) {
                        return false;
                    }
                });

                // We check that all of them are correct
                const receiptsOk = receiptsCheckOk.every((e) => e == true);

                const finalArray = [];

                // If so, we get the corresponding transaction
                if (receiptsOk) {
                    return receiptArray.reduce((chain, receipt) => {
                        return chain.then(() => {
                            return api.transaction.get(receipt.header.tx_id).then((tx) => {
                                finalArray.push({
                                    receipt: receipt,
                                    confirmations: tx.confirmations,
                                    confirmedOn: tx.confirmedOn
                                })
                            })
                        })
                    }, Promise.resolve())

                    // We got a array of object with {receipt, confirmations, confirmedOn}, so we forward it
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

        return hashStringOrFile(file, progressCallback)
            .then((hash) => {
                api.receipt.validate(receipt);

                if (receipt.target.target_hash != hash) throw new Error("target_hash_mismatch");

                return api.transaction.get(receipt.header.tx_id)
                    .catch((error) => {
                        if (error.message == 'tx_not_found') {
                            throw error;
                        }
                        else {
                            // we try a second time with a different provider
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
            .then((tx) => {
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
    function hashStringOrFile(file, progressCallback) {
        let resolveHash;
        let rejectHash;
        const hashPromise = new Promise((resolve, reject) => {
            resolveHash = resolve;
            rejectHash = reject;
        });

        if (file instanceof File) {

            if (!api.file || !api.file.Hasher) throw new Error("missing_woleet_hash_dependency");

            const hasher = new api.file.Hasher;
            //noinspection JSUnusedLocalSymbols
            hasher.on('result', function (message, file) {
                resolveHash(message.result);
                if (progressCallback) progressCallback({progress: 1.0, file: File})
            });

            if (progressCallback && typeof progressCallback == 'function') {
                hasher.on('progress', progressCallback);
            }

            hasher.on('error', rejectHash);

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
    }

    return api;
});