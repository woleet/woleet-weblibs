'use strict';

/**
 * @typedef {Object}   AnchorIDsPage
 * @typedef {String[]} Page.content array of anchorID
 * @typedef {Number}   Page.totalPages number of pages with the current size
 * @typedef {Number}   Page.totalElements number of elements matching the request
 * @typedef {Boolean}  Page.last boolean that indicates if the current page is the last one
 * @typedef {Boolean}  Page.sort boolean that indicates if the current page is the last one
 * @typedef {Boolean}  Page.first boolean that indicates if the current page is the first one
 * @typedef {Number}   Page.numberOfElements number of elements matching the request on the current page
 * @typedef {Number}   Page.size current page size
 * @typedef {Number}   Page.number current number (starting at 0)
 */

;(function (root, factory) {
    root.woleet = factory(root.woleet);
})(window, function (woleet) {

    function RequestError(req) {
        this.name = 'getJSON';
        this.message = req.statusText && req.statusText.length ? req.statusText : 'Error while getting data';
        this.code = req.status;
        //noinspection JSUnusedGlobalSymbols
        this.body = req.response;
        this.stack = new Error().stack;
    }

    RequestError.prototype = Object.create(Error.prototype);
    //noinspection JSUnusedGlobalSymbols
    RequestError.prototype.constructor = RequestError;

    function getJSON(url) {
        var req = new XMLHttpRequest();

        return new Promise(function (resolve, reject) {

            req.onload = function () {

                switch (req.status) {
                    case 200:
                    case 201:
                        typeof req.response == "string" ? resolve(JSON.parse(req.response)) : resolve(req.response); // ie
                        break;
                    case 404:
                        resolve(null);
                        break;
                    default:
                        reject(new RequestError(req));
                        break;
                }
            };

            req.onerror = function () {
                reject(new RequestError(req));
            };

            req.open("GET", url, true);
            req.responseType = "json";
            req.json = "json";
            req.send();
        });
    }

    /**
     * @param {String} tx_id
     * @param {Number} confirmations
     * @param {Date} confirmed_at
     * @param {String} block_hash
     * @param {String} op_return
     */
    function makeTransaction(tx_id, confirmations, confirmed_at, block_hash, op_return) {

        if (confirmed_at.toString() == "Invalid Date") confirmed_at = null;

        return {
            tx_id: tx_id,
            confirmations: confirmations,
            confirmedAt: confirmed_at,
            blockHash: block_hash,
            opReturn: op_return
        };
    }

    var woleetAPI = "https://api.woleet.io/v1";
    var api = woleet || {};
    api.receipt = api.receipt || {};
    api.anchor = api.anchor || {};

    api.transaction = function () {
        var default_api = 'woleet.io';

        return {
            setDefaultProvider: function setDefaultProvider(api) {
                switch (api) {
                    case 'blockcypher.com':
                        default_api = api;
                        break;
                    case 'woleet.io':
                        default_api = api;
                        break;
                    case 'chain.so':
                    default:
                        default_api = 'chain.so';
                        break;
                }
            },

            /**
             * @param tx_id
             * @returns {Promise.<Transaction>}
             */
            get: function get(tx_id) {
                switch (default_api) {
                    case 'woleet.io':
                        return getJSON(woleetAPI + '/bitcoin/transaction/' + tx_id).then(function (res) {
                            if (!res) {
                                throw new Error('tx_not_found');
                            } else {
                                //noinspection JSUnresolvedVariable
                                return makeTransaction(res.txid, res.confirmations, new Date(res.time * 1000), res.blockhash || 0, function (outputs) {
                                    var opr_return_found = null;
                                    outputs.forEach(function (output) {
                                        if (output.hasOwnProperty('scriptPubKey')) {
                                            //noinspection JSUnresolvedVariable
                                            if (output.scriptPubKey.hasOwnProperty('asm')) {
                                                //noinspection JSUnresolvedVariable
                                                if (output.scriptPubKey.asm.indexOf('OP_RETURN') != -1) {
                                                    //noinspection JSUnresolvedVariable
                                                    opr_return_found = output.scriptPubKey.asm.split(' ')[1];
                                                }
                                            }
                                        }
                                        if (opr_return_found) return true; //breaks foreach
                                    });
                                    return opr_return_found;
                                }(res.vout || []));
                            }
                        });
                    case 'chain.so':
                        return getJSON('https://chain.so/api/v2/get_tx/BTC/' + tx_id).then(function (res) {
                            if (!res || res.status == 'fail') {
                                throw new Error('tx_not_found');
                            } else {
                                //noinspection JSUnresolvedVariable
                                return makeTransaction(res.data.txid, res.data.confirmations, new Date(res.data.time * 1000), res.data.blockhash, function (outputs) {
                                    var opr_return_found = null;
                                    outputs.forEach(function (output) {
                                        if (output.hasOwnProperty('script')) {
                                            //noinspection JSUnresolvedVariable
                                            if (output.script.indexOf('OP_RETURN') != -1) {
                                                //noinspection JSUnresolvedVariable
                                                opr_return_found = output.script.split(' ')[1];
                                            }
                                            if (opr_return_found) return true; //breaks foreach
                                        }
                                    });
                                    return opr_return_found;
                                }(res.data.outputs || []));
                            }
                        });
                    case 'blockcypher.com':
                        return getJSON('https://api.blockcypher.com/v1/btc/main/txs/' + tx_id).then(function (res) {
                            if (!res || res.error) {
                                throw new Error('tx_not_found');
                            } else {
                                //noinspection JSUnresolvedVariable
                                return makeTransaction(res.hash, res.confirmations, new Date(res.confirmed), res.block_hash, function (outputs) {
                                    var opr_return_found = null;
                                    outputs.forEach(function (output) {
                                        if (output.hasOwnProperty('data_hex')) {
                                            //noinspection JSUnresolvedVariable
                                            opr_return_found = output.data_hex;
                                        }
                                        if (opr_return_found) return true; //breaks foreach
                                    });
                                    return opr_return_found;
                                }(res.outputs || []));
                            }
                        });
                }
            }
        };
    }();

    /**
     * @param {String} hash
     * @param {Number} [size]
     * @returns {Promise<AnchorIDsPage>}
     */
    api.anchor.getAnchorIDs = function (hash, size) {
        size = size || 20;
        return getJSON(woleetAPI + "/anchorids?size=" + size + "&hash=" + hash);
    };

    /**
     * @param {String} anchorId
     * @returns {Promise<Receipt>}
     */
    api.receipt.get = function (anchorId) {
        return getJSON(woleetAPI + "/receipt/" + anchorId).then(function (res) {
            if (!res) {
                throw new Error('not_found');
            } else {
                return res;
            }
        });
    };

    /**
     * @param {Hash} hash
     * @returns {boolean}
     */
    api.isSHA256 = function (hash) {
        var sha256RegExp = /^[A-Fa-f0-9]{64}$/;
        return sha256RegExp.test(hash);
    };

    return api;
});