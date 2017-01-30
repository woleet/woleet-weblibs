;(function (root, factory) {
    root.woleet = factory(root.woleet)
})(this, function (woleet) {

    var api = woleet || {};
    api.receipt = api.receipt || {};
    api.anchor = api.anchor || {};
    api.verify = api.verify || {};

    /**
     * @param {File|String} file
     * @returns {Promise.<Object[]>}
     */
    api.verify.WoleetDAB = function (file) {

        return hashStringOrFile(file)

        // we get the hash, so now we get the corresponding anchor ids
            .then(function (hash) {
                return api.anchor.getAnchorIDs(hash);
            })
            //we got ids (an array), for each of them, we get the corresponding receipts
            .then(function (anchorIDsPage) {
                var receiptArray = [];
                return anchorIDsPage.content.reduce(function (chain, anchorId) {
                    return chain.then(function () {
                        return api.receipt.get(anchorId).then(function (receipt) {
                            return receiptArray.push(receipt)
                        }, function (err) {
                            //if we cannot get the corresponding receipt for
                            //this anchorID because it's not yet processed (202)
                            //we ignore this element, else we forward error
                            if(err.code != 202) throw err;
                        })
                    })
                }, Promise.resolve())

                //we got a receipt array, so we forward it
                    .then(function () {
                        //if we had a match but can't get a receipt
                        if(!receiptArray.length && anchorIDsPage.content.length) {
                            throw new Error('file_matched_but_anchor_not_yet_processed')
                        }

                        return receiptArray;
                    });

            })

            .then(function (receiptArray) {

                // we check each receipt we got
                var receiptsCheckOk = receiptArray.map(function (receipt) {
                    try {
                        return api.receipt.validate(receipt);
                    } catch (err) {
                        return false;
                    }
                });

                // we check that all of them are correct
                var receiptsOk = receiptsCheckOk.every(function (e) {
                    return e == true
                });

                var finalArray = [];

                //if so, we get the corresponding transaction
                if (receiptsOk) {
                    return receiptArray.reduce(function (chain, receipt) {
                        return chain.then(function () {
                            return api.transaction.get(receipt.header.tx_id).then(function (tx) {
                                finalArray.push({
                                    receipt: receipt,
                                    confirmations: tx.confirmations,
                                    date: tx.confirmedAt
                                })
                            })
                        })
                    }, Promise.resolve())

                    //we got a array of object with the {receipt, transactionDate}, so we forward it
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
     * @returns {Promise<Object>}
     */
    api.verify.DAB = function (file, receipt) {

        return hashStringOrFile(file)

            .then(function (hash) {

                api.receipt.validate(receipt);

                if (receipt.target.target_hash != hash) throw new Error("target_hash_mismatch");

                return api.transaction.get(receipt.header.tx_id)
                    .then(function (tx) {
                        return tx;
                    }, function (err) {
                        if (err.message == 'tx_not_found') {
                            throw err;
                        }
                        else {
                            throw new Error("error_while_getting_transaction")
                        }
                    })
            })

            .then(function (tx) {

                if (tx.opReturn == receipt.header.merkle_root) return {
                    receipt: receipt,
                    confirmations: tx.confirmations,
                    date: tx.confirmedAt
                }; // opReturn matches root
                else throw new Error('opReturn_mismatches_merkleRoot')

            })

    };

    var hashStringOrFile = function (file) {
        var resolveHash;
        var rejectHash;
        var hashPromise = new Promise(function (resolve, reject) {
            resolveHash = resolve;
            rejectHash = reject;
        });

        if (file instanceof File) {

            if (!api.file || !api.file.Hasher) throw new Error("missing_woleet_hash_dependency");

            var hasher = new api.file.Hasher;
            hasher.on('result', function (message, file) {
                resolveHash(message.result);
            });

            hasher.on('error', function (error) {
                rejectHash(error);
            });

            hasher.start(file)
        }
        else if (typeof file == "string") {
            if (api.isSHA256(file)) {
                resolveHash(file);
            }
            else {
                rejectHash(new Error("parameter_string_not_a_sha256_hash"));
            }
        }
        else {
            rejectHash(new Error("invalid_parameter"));
        }

        return hashPromise;
    };

    return api;
});