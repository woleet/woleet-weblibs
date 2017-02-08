'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

    /**
     * @param {String} url
     * @param {{method?:string, data?:string, token?:string}} options
     * @returns {Promise}
     */
    function getJSON(url) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

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

            req.open(options.method || "GET", url, true);
            if (options.token) req.setRequestHeader("Authorization", "Bearer " + options.token);
            if (options.method == 'POST') req.setRequestHeader('Content-Type', 'application/json');
            req.setRequestHeader('Accept', 'application/json');
            req.responseType = "json";
            req.json = "json";
            req.send(_typeof(options.data) == 'object' ? JSON.stringify(options.data) : options.data);
        });
    }

    /**
     * @param {String} txId
     * @param {Number} confirmations
     * @param {Date} confirmedOn
     * @param {String} blockHash
     * @param {String} opReturn
     */
    function makeTransaction(txId, confirmations, confirmedOn, blockHash, opReturn) {

        if (confirmedOn.toString() == "Invalid Date") confirmedOn = null;

        return {
            txId: txId,
            confirmations: confirmations,
            confirmedOn: confirmedOn,
            blockHash: blockHash,
            opReturn: opReturn
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
             * @param txId
             * @returns {Promise.<Transaction>}
             */
            get: function get(txId) {
                switch (default_api) {
                    case 'woleet.io':
                        return getJSON(woleetAPI + '/bitcoin/transaction/' + txId).then(function (res) {
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
                        return getJSON('https://chain.so/api/v2/get_tx/BTC/' + txId).then(function (res) {
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
                        return getJSON('https://api.blockcypher.com/v1/btc/main/txs/' + txId).then(function (res) {
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

    api._getJSON = getJSON;
    api._woleetAPI = woleetAPI;

    return api;
});
'use strict';

/**
 * @typedef {Object}   Leaf
 * @typedef {Hash}     Leaf.left
 * @typedef {Hash}     Leaf.right
 * @typedef {Hash}     Leaf.parent
 */

/**
 * @typedef {Object}   Receipt
 * @typedef {Object}   Receipt.header
 * @typedef {String}   Receipt.header.chainpoint_version
 * @typedef {String}   Receipt.header.hash_type
 * @typedef {String}   Receipt.header.merkle_root
 * @typedef {String}   Receipt.header.tx_id
 * @typedef {String}   Receipt.header.timestamp
 * @typedef {Object}   Receipt.target
 * @typedef {String}   Receipt.target.target_hash
 * @typedef {String}   Receipt.target.target_URI
 * @typedef {Leaf[]}   Receipt.target.target_proof
 * @typedef {Object[]} Receipt.extra
 */

;(function (root, factory) {
    root.woleet = factory(root.woleet);
})(window, function (woleet) {

    /**
     * @typedef {String} Hash
     * @typedef {function(String): Hash} HashFunction
     */

    /**
     * @type HashFunction
     * @param {String} content
     * @returns {Hash}
     */

    var sha256 = function () {

        /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
        /* SHA-256 (FIPS 180-4) implementation in JavaScript                  (c) Chris Veness 2002-2016  */
        /*                                                                                   MIT Licence  */
        /* www.movable-type.co.uk/scripts/sha256.html                                                     */
        /*                                                                                                */
        /*  - see http://csrc.nist.gov/groups/ST/toolkit/secure_hashing.html                              */
        /*        http://csrc.nist.gov/groups/ST/toolkit/examples.html                                    */
        /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

        'use strict';

        function R(n, x) {
            //noinspection JSConstructorReturnsPrimitive
            return x >>> n | x << 32 - n;
        }

        function F0(x) {
            //noinspection JSConstructorReturnsPrimitive
            return R(2, x) ^ R(13, x) ^ R(22, x);
        }

        function F1(x) {
            //noinspection JSConstructorReturnsPrimitive
            return R(6, x) ^ R(11, x) ^ R(25, x);
        }

        function S0(x) {
            //noinspection JSConstructorReturnsPrimitive
            return R(7, x) ^ R(18, x) ^ x >>> 3;
        }

        function S1(x) {
            //noinspection JSConstructorReturnsPrimitive
            return R(17, x) ^ R(19, x) ^ x >>> 10;
        }

        function Ch(x, y, z) {
            //noinspection JSConstructorReturnsPrimitive
            return x & y ^ ~x & z;
        }

        function Maj(x, y, z) {
            //noinspection JSConstructorReturnsPrimitive
            return x & y ^ x & z ^ y & z;
        }

        return function (msg) {
            var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];

            var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

            msg += String.fromCharCode(0x80);
            var l = msg.length / 4 + 2;
            var N = Math.ceil(l / 16);
            var M = new Array(N);

            for (var i = 0; i < N; i++) {
                M[i] = new Array(16);
                for (var j = 0; j < 16; j++) {
                    M[i][j] = msg.charCodeAt(i * 64 + j * 4) << 24 | msg.charCodeAt(i * 64 + j * 4 + 1) << 16 | msg.charCodeAt(i * 64 + j * 4 + 2) << 8 | msg.charCodeAt(i * 64 + j * 4 + 3);
                }
            }
            var lenHi = (msg.length - 1) * 8 / Math.pow(2, 32);
            var lenLo = (msg.length - 1) * 8 >>> 0;
            M[N - 1][14] = Math.floor(lenHi);
            M[N - 1][15] = lenLo;

            for (var _i = 0; _i < N; _i++) {
                var W = new Array(64);

                for (var t = 0; t < 16; t++) {
                    W[t] = M[_i][t];
                }for (var _t = 16; _t < 64; _t++) {
                    W[_t] = S1(W[_t - 2]) + W[_t - 7] + S0(W[_t - 15]) + W[_t - 16] >>> 0;
                }

                var a = H[0],
                    b = H[1],
                    c = H[2],
                    d = H[3],
                    e = H[4],
                    f = H[5],
                    g = H[6],
                    _h = H[7];

                for (var _t2 = 0; _t2 < 64; _t2++) {
                    var T1 = _h + F1(e) + Ch(e, f, g) + K[_t2] + W[_t2];
                    var T2 = F0(a) + Maj(a, b, c);
                    _h = g;
                    g = f;
                    f = e;
                    e = d + T1 >>> 0;
                    d = c;
                    c = b;
                    b = a;
                    a = T1 + T2 >>> 0;
                }

                H[0] = H[0] + a >>> 0;
                H[1] = H[1] + b >>> 0;
                H[2] = H[2] + c >>> 0;
                H[3] = H[3] + d >>> 0;
                H[4] = H[4] + e >>> 0;
                H[5] = H[5] + f >>> 0;
                H[6] = H[6] + g >>> 0;
                H[7] = H[7] + _h >>> 0;
            }

            for (var h = 0; h < H.length; h++) {
                H[h] = ('00000000' + H[h].toString(16)).slice(-8);
            }return H.join('');
        };
    }();

    /**
     * Build a Merkle branch.
     * @param {Hash} left
     * @param {Hash} right
     * @param {HashFunction} [hash_f]
     * @constructor
     */
    function MerkleBranch(left, right, hash_f) {
        /**
         * @type {function(String): Hash}
         */
        var _hash_f = hash_f || sha256;
        /***
         * @type {Hash}
         */
        var _left = left;
        /**
         * @type {Hash}
         */
        var _right = right;
        /**
         * @type {Hash}
         */
        var _parent = _hash_f(_left + _right);

        /**
         * Get the parent of the branch.
         * @returns {Hash}
         */
        this.get_parent = function () {
            return _parent;
        };

        /**
         * Check if a branch contains a hash.
         * @param {Hash} target
         * @returns {boolean}
         */
        this.contains = function (target) {
            return _left == target || _right == target;
        };

        /**
         * @returns {{parent: Hash, left: Hash, right: Hash}}
         */
        this.get_json = function () {
            return {
                "parent": _parent,
                "left": _left,
                "right": _right
            };
        };
    }

    /**
     * Builds a Merkle proof.
     * @param {String} target
     * @param {Function} [hash_f]
     * @constructor
     */
    function MerkleProof(target, hash_f) {
        var self = this;

        //noinspection JSUnusedGlobalSymbols
        this.hash_f = hash_f || sha256;
        this.branches = [];
        this.target = target;

        /**
         * Add a branch to the proof.
         * @param {MerkleBranch} branch
         */
        this.add = function (branch) {
            self.branches.push(branch);
        };

        /**
         * Returns the root string if proof is valid, false if it's not
         * @returns {String|Boolean}
         */
        this.is_valid = function () {
            // Check if the target hash is in the proof.

            // We assume that the leaf is contained in the
            // first branch of the proof, so then we check
            // if the parent is contained in each higher
            // branch.

            var new_target = self.target;

            if (!self.branches.length) return false;

            for (var i = 0, branch; i < self.branches.length; i++) {
                branch = self.branches[i];
                if (!branch.contains(new_target)) {
                    return false;
                }
                new_target = branch.get_parent();
            }

            return new_target;
        };

        // MerkleProof to machine readable JSON.
        this.get_json = function () {
            var json_data = [];
            self.branches.forEach(function (branch) {
                json_data.push(branch.get_json());
            });
            return json_data;
        };
    }

    var api = woleet || {};
    api.receipt = api.receipt || {};

    /**
     * Validate a receipt.
     * @param {Receipt} receipt
     * @returns {Boolean} true if the receipt is valid
     */
    api.receipt.validate = function (receipt) {

        if (!receipt || !receipt.target || !receipt.target.target_hash || !receipt.target.target_proof || !(receipt.target.target_proof instanceof Array) || !receipt.header || !receipt.header.hash_type || !receipt.header.merkle_root || !receipt.header.tx_id) {
            throw new Error("invalid_receipt_format");
        }

        for (var i = 0; i < receipt.target.target_proof.length; i++) {
            var branch = receipt.target.target_proof[i];
            if (!branch.left || !branch.right || !branch.parent) {
                throw new Error("invalid_target_proof");
            }
            if (!api.isSHA256(branch.left) || !api.isSHA256(branch.right) || !api.isSHA256(branch.parent)) {
                throw new Error("non_sha256_target_proof_element");
            }
        }

        // If no Merkle proof
        if (receipt.target.target_proof.length == 0) {
            // Receipt is valid if target hash is Merkle root
            if (receipt.target.target_hash == receipt.header.merkle_root) return true;else throw new Error("merkle_root_mismatch");
        }

        // If there is a Merkle proof
        else {

                // Build the Merkle proof while checking its integrity
                var proof = new MerkleProof(receipt.target.target_hash);
                receipt.target.target_proof.forEach(function (branch) {

                    // Build a new Merkle branch
                    var merkleBranch = new MerkleBranch(branch.left, branch.right);

                    // Check that provided parent is correctly computed
                    if (!merkleBranch.get_parent() == branch.parent) {
                        throw new Error("invalid_parent_in_proof_element");
                    }

                    // Add Merkle branch to the Merkle proof
                    proof.add(merkleBranch);
                });

                // Receipt is valid if Merkle proof root is  Merkle root
                if (proof.is_valid() == receipt.header.merkle_root) return true;else throw new Error("merkle_root_mismatch");
            }
    };

    return api;
});
"use strict";

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
                        return receiptArray.push(receipt);
                    }, function (error) {
                        // if we cannot get the corresponding receipt for
                        // this anchorID because it's not yet processed (202)
                        // we ignore this element, else we forward error
                        if (error.code != 202) throw error;
                    });
                });
            }, Promise.resolve())

            // We got a receipt array, so we forward it
            .then(function () {
                // if we had a match but can't get a receipt
                if (!receiptArray.length && anchorIDsPage.content.length) {
                    throw new Error('file_matched_but_anchor_not_yet_processed');
                }

                return receiptArray;
            });
        }).then(function (receiptArray) {

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
                return e == true;
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
                            });
                        });
                    });
                }, Promise.resolve())

                // We got a array of object with the {receipt, transactionDate}, so we forward it
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

        return hashStringOrFile(file, progressCallback).then(function (hash) {

            api.receipt.validate(receipt);

            if (receipt.target.target_hash != hash) throw new Error("target_hash_mismatch");

            return api.transaction.get(receipt.header.tx_id).then(function (tx) {
                return tx;
            }, function (error) {
                if (error.message == 'tx_not_found') {
                    throw error;
                } else {
                    throw new Error("error_while_getting_transaction");
                }
            });
        }).then(function (tx) {

            if (tx.opReturn == receipt.header.merkle_root) return {
                receipt: receipt,
                confirmations: tx.confirmations,
                confirmedOn: tx.confirmedOn
            }; // opReturn matches root
            else throw new Error('opReturn_mismatches_merkleRoot');
        });
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

            var hasher = new api.file.Hasher();
            //noinspection JSUnusedLocalSymbols
            hasher.on('result', function (message, file) {
                resolveHash(message.result);
                if (progressCallback) progressCallback({ progress: 1.0, file: File });
            });

            if (progressCallback && typeof progressCallback == 'function') {
                hasher.on('progress', progressCallback);
            }

            hasher.on('error', function (error) {
                rejectHash(error);
            });

            hasher.start(file);
        } else if (typeof file == "string") {
            if (api.isSHA256(file)) {
                //noinspection JSUnusedAssignment
                resolveHash(file);
            } else {
                //noinspection JSUnusedAssignment
                rejectHash(new Error("parameter_string_not_a_sha256_hash"));
            }
        } else {
            //noinspection JSUnusedAssignment
            rejectHash(new Error("invalid_parameter"));
        }

        return hashPromise;
    };

    return api;
});
'use strict';

/**
 * @typedef {Object}   ProgressMessage
 * @typedef {Number}   ProgressMessage.progress (float number)
 * @typedef {File}     ProgressMessage.file
 */

/**
 * @typedef {Object}   StartMessage
 * @typedef {Boolean}  StartMessage.start always true
 * @typedef {File}     ProgressMessage.file
 */

/**
 * @typedef {Object}   ErrorMessage
 * @typedef {Error}    ErrorMessage.error
 * @typedef {File}     EndMessage.file
 */

/**
 * @typedef {Object}   EndMessage
 * @typedef {String}   EndMessage.end hash of the file
 * @typedef {File}     EndMessage.file
 */

;(function (root, factory) {
    root.woleet = factory(root.woleet);
})(window, function (woleet) {

    var api = woleet || {};
    api.file = api.file || {};

    var isHTTPS = location.protocol == 'https:';

    //noinspection JSUnresolvedVariable
    var testNativeCryptoSupport = window.crypto && window.crypto.subtle && window.crypto.subtle.digest && isHTTPS;

    var testFileReaderSupport = checkFileReaderSyncSupport();

    /**
     * @returns {String} get the base path (including final '/') of the current script.
     */
    function findBasePath() {
        var scripts = document.getElementsByTagName('script');
        var scriptsArray = Array.prototype.slice.call(scripts, 0); // Converts collection to array
        var regex = /.*woleet-(hashfile|weblibs)[.min]*\.js$/;
        var script = scriptsArray.find(function (script) {
            return script.src && script.src.match(regex);
        });
        return script && script.src ? script.src.substr(0, script.src.lastIndexOf("/") + 1) : null;
    }

    // Guess the path of the worker script: same as current script's or defined by woleet.workerScriptPath
    var basePath = findBasePath();
    var DEFAULT_WORKER_SCRIPT = "woleet-hashfile-worker.min.js";
    //noinspection JSUnresolvedVariable
    var workerScriptPath = api.workerScriptPath || (basePath ? basePath + DEFAULT_WORKER_SCRIPT : null);
    if (!workerScriptPath) throw new Error('Cannot find ' + DEFAULT_WORKER_SCRIPT);

    /**
     * Check support for workers.
     */
    function checkFileReaderSyncSupport() {

        function makeWorker(script) {
            //noinspection JSUnresolvedVariable
            var URL = window.URL || window.webkitURL;
            var Blob = window.Blob;
            var Worker = window.Worker;

            if (!URL || !Blob || !Worker || !script) return null;

            var blob = new Blob([script]);
            //noinspection JSUnresolvedFunction
            return new Worker(URL.createObjectURL(blob));
        }

        return new Promise(function (resolve) {
            var syncDetectionScript = "onmessage = function(e) { postMessage(!!FileReaderSync); };";
            try {
                var worker = makeWorker(syncDetectionScript);
                if (worker) {
                    worker.onmessage = function (e) {
                        resolve(e.data);
                    };
                    worker.postMessage({});
                } else resolve(false);
            } catch (err) {
                resolve(false);
            }
        });
    }

    api.file.Hasher = function () {

        var ready = true;
        var cb_start = void 0,
            cb_progress = void 0,
            cb_result = void 0,
            cb_error = void 0;

        /**
         * @param {String} event
         * @param {Function} callback
         */
        this.on = function (event, callback) {
            switch (event) {
                case 'start':
                    cb_start = callback;
                    break;
                case 'progress':
                    cb_progress = callback;
                    break;
                case 'error':
                    cb_error = callback;
                    break;
                case 'result':
                    cb_result = callback;
                    break;
                default:
                    throw new Error('Invalid event name "' + event + '"');
            }
        };

        /**
         * @constructor
         */
        var HashWorker = function HashWorker() {

            var worker = new Worker(workerScriptPath);

            /**
             * @param {File} file
             * @returns {Promise}
             */
            this.hash = function (file) {
                return new Promise(function (next, reject) {

                    worker.onmessage = function (message) {
                        //handling worker message
                        if (message.data.progress != undefined) {
                            if (cb_progress) cb_progress(message.data);
                        } else if (message.data.result) {
                            if (cb_result) cb_result(message.data);
                            next(worker);
                        } else if (message.data.start) {
                            if (cb_start) cb_start(message.data);
                        } else if (message.data.error) {
                            var error = message.data.error;
                            if (cb_error) cb_error(error);else reject(error);
                        } else {
                            console.trace("Unexpected worker message: ", message);
                        }
                    };

                    worker.postMessage(file);
                });
            };
        };

        /**
         * @param {File} file
         * @returns {Promise}
         */
        var hashLocal = function hashLocal(file) {

            return new Promise(function (next, reject) {
                var error = new Error("file_too_big_to_be_hashed_without_worker");
                if (file.size > 5e7) {
                    ready = true;
                    if (cb_error) return cb_error({ error: error, file: file });else reject(error);
                }

                var reader = new FileReader();

                var sha256 = CryptoJS.algo.SHA256.create();
                var hash = void 0,
                    prev = 0;

                reader.onloadstart = function () {
                    if (cb_start) cb_start({ start: true, file: file });
                };

                reader.onloadend = function () {
                    hash.finalize();
                    if (cb_result) cb_result({
                        result: hash._hash.toString(CryptoJS.enc.Hex),
                        file: file
                    });
                    next();
                };

                reader.onprogress = function (e) {
                    //noinspection JSUnresolvedVariable
                    /** @type ArrayBuffer */
                    var buf = e.target.result;
                    //noinspection JSUnresolvedVariable
                    var blob = buf.slice(prev, e.loaded);
                    var chunkUint8 = new Uint8Array(blob);
                    var wordArr = CryptoJS.lib.WordArray.create(chunkUint8);
                    hash = sha256.update(wordArr);
                    //noinspection JSUnresolvedVariable
                    prev = e.loaded;
                    if (cb_progress) {
                        //noinspection JSUnresolvedVariable
                        cb_progress({ progress: e.loaded / e.total, file: file });
                    }
                };

                reader.readAsArrayBuffer(file);
            });
        };

        /**
         * @param {File} file
         * @returns {Promise}
         */
        var hashLocalWithNativeAPI = function hashLocalWithNativeAPI(file) {
            return new Promise(function (resolve, reject) {
                var algo = "SHA-256";
                // entry point
                var reader = new FileReader();

                reader.onloadstart = function () {
                    if (cb_start) cb_start({ start: true, file: file });
                };

                reader.onprogress = function (e) {
                    if (cb_progress) {
                        //noinspection JSUnresolvedVariable
                        cb_progress({ progress: e.loaded / e.total, file: file });
                    }
                };

                reader.onload = function (event) {
                    var data = event.target.result;
                    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
                    window.crypto.subtle.digest(algo, data).then(function (hash) {
                        var hashResult = new Uint8Array(hash);
                        var hexString = hashResult.reduce(function (res, e) {
                            return res + ('00' + e.toString(16)).slice(-2);
                        }, '');
                        if (cb_result) cb_result({ result: hexString, file: file });
                        resolve();
                    }).catch(function (error) {
                        return cb_error ? cb_error({ error: error, file: file }) : reject(error);
                    });
                };

                reader.readAsArrayBuffer(file);
            });
        };

        this.start = function (files) {

            if (!ready) throw new Error("not_ready");

            ready = false;

            // checking input type
            if (!(files instanceof FileList || files instanceof File)) throw new Error("invalid_parameter");

            testFileReaderSupport.then(function (WorkerSupported) {
                var hashMethod = null;
                if (testNativeCryptoSupport) {
                    hashMethod = hashLocalWithNativeAPI;
                } else if (WorkerSupported) {
                    var hashWorker = new HashWorker();
                    hashMethod = hashWorker.hash;
                } else if (typeof CryptoJS !== 'undefined') {
                    hashMethod = hashLocal;
                } else {
                    throw new Error("no_viable_hash_method");
                }

                /**
                 * iterator function with selected hash method
                 * @param i current index of the list
                 * @param len total size of the list
                 * @param worker passing worker through iterator if selected method is hashWorker in order to terminate it
                 */
                function iter(i, len, worker) {
                    if (i >= len) {
                        ready = true;
                        if (worker) worker.terminate();
                    } else {
                        hashMethod(files[i]).then(function (worker) {
                            iter(++i, len, worker);
                        });
                    }
                }

                // entry point
                if (files instanceof FileList) {
                    // files is a FileList
                    iter(0, files.length);
                } else if (files instanceof File) {
                    // files is a single file
                    hashMethod(files).then(function (worker) {
                        iter(1, 0, worker); // set ready state with iter function (i > len)
                    });
                }
            });
        };

        this.isReady = function () {
            return ready;
        };
    };

    /**
     * @param {File|String} file
     * @param {Function} [progressCallback]
     * @returns {Promise<Hash>}
     */
    api._hashStringOrFile = function (file, progressCallback) {
        var resolveHash = void 0;
        var rejectHash = void 0;
        var hashPromise = new Promise(function (resolve, reject) {
            resolveHash = resolve;
            rejectHash = reject;
        });

        if (file instanceof File) {

            if (!api.file || !api.file.Hasher) throw new Error("missing_woleet_hash_dependency");

            var hasher = new api.file.Hasher();
            //noinspection JSUnusedLocalSymbols
            hasher.on('result', function (message, file) {
                resolveHash(message.result);
                if (progressCallback) progressCallback({ progress: 1.0, file: File });
            });

            if (progressCallback && typeof progressCallback == 'function') {
                hasher.on('progress', progressCallback);
            }

            hasher.on('error', function (error) {
                rejectHash(error);
            });

            hasher.start(file);
        } else if (typeof file == "string") {
            if (api.isSHA256(file)) {
                //noinspection JSUnusedAssignment
                resolveHash(file);
            } else {
                //noinspection JSUnusedAssignment
                rejectHash(new Error("parameter_string_not_a_sha256_hash"));
            }
        } else {
            //noinspection JSUnusedAssignment
            rejectHash(new Error("invalid_parameter"));
        }

        return hashPromise;
    };

    return api;
});