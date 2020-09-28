/**
 * @typedef {Object}   AnchorIDsPage
 * @typedef {String[]} AnchorIDsPage.content array of anchor IDs
 * @typedef {Number}   AnchorIDsPage.totalPages number of pages with the current size
 * @typedef {Number}   AnchorIDsPage.totalElements number of elements matching the request
 * @typedef {Boolean}  AnchorIDsPage.last boolean that indicates if the current page is the last one
 * @typedef {Boolean}  AnchorIDsPage.sort boolean that indicates if the current page is the last one
 * @typedef {Boolean}  AnchorIDsPage.first boolean that indicates if the current page is the first one
 * @typedef {Number}   AnchorIDsPage.numberOfElements number of elements matching the request on the current page
 * @typedef {Number}   AnchorIDsPage.size current page size
 * @typedef {Number}   AnchorIDsPage.number current page number (starting at 0)
 */

/**
 * @param getJSON
 * @return {{}}
 */
module.exports = function (getJSON) {

  const woleet = { receipt: {}, identity: {} };

  /**
   * Convert a JSON object to URI parameters.
   * @param {Object} data the JSON object to convert
   * @returns {String} :: the URI parameters
   */
  function dataToURI(data) {
    if (!data || Object.keys(data).length === 0)
      return '';
    const _data = [];
    for (let prop in data) {
      if (data[prop])
        _data.push([encodeURIComponent(prop), encodeURIComponent(data[prop])].join('='));
    }
    return "?" + _data.join('&');
  }

  /**
   * @param {String} txId
   * @param {Number} confirmations
   * @param {Date} timestamp
   * @param {String} blockHash
   * @param {String} opReturn
   * @private
   *
   * @return {{txId: string, confirmations: number, timestamp: Date, blockHash: string, opReturn: string}}
   */
  function makeTransaction(txId, confirmations, timestamp, blockHash, opReturn) {

    if (timestamp.toString() === 'Invalid Date')
      timestamp = null;

    return {
      txId: txId,
      confirmations: confirmations,
      timestamp: timestamp,
      blockHash: blockHash,
      opReturn: opReturn
    }
  }

  const DEFAULT_WOLEET_API_URL = "https://api.woleet.io/v1";
  let woleetApiUrl = DEFAULT_WOLEET_API_URL;

  const DEFAULT_TRANSACTION_PROVIDER = 'woleet.io';
  let transactionProvider = DEFAULT_TRANSACTION_PROVIDER;

  woleet.config = {

    /**
     * @param _transactionProvider Transaction provider
     */
    setDefaultTransactionProvider: (_transactionProvider) => {
      switch (_transactionProvider) {
        case 'blockcypher.com':
        case 'blockstream.info':
        case 'woleet.io':
          transactionProvider = _transactionProvider;
          break;
        default:
          transactionProvider = DEFAULT_TRANSACTION_PROVIDER;
          break;
      }
    },

    /**
     * @param _woleetApiUrl Woleet API URL
     */
    setDefaultWoleetApiUrl: (_woleetApiUrl) => {
      woleetApiUrl = _woleetApiUrl;
    }
  }

  woleet.transaction = {

    /**
     * @param txId
     * @returns {Promise.<Transaction>}
     */
    get: function (txId) {
      switch (transactionProvider) {
        case 'woleet.io':
          return getJSON(woleetApiUrl + '/bitcoin/transaction/' + txId)
            .then((tx) => {

              if (!tx.time || !tx.confirmations) {
                throw new Error('tx_not_confirmed');
              }

              //noinspection JSUnresolvedVariable
              return makeTransaction(tx.txid, tx.confirmations, new Date(tx.time * 1000), tx.blockhash,
                ((output) => output ? ((output.scriptPubKey.asm).split(' '))[1] : null)((tx.vout || [])
                  .find((o) => o.hasOwnProperty('scriptPubKey')
                    && o.scriptPubKey.hasOwnProperty('asm')
                    && o.scriptPubKey.asm.startsWith('OP_RETURN'))));
            })
            .catch(() => {
              throw new Error('tx_not_found');
            });
        case 'blockstream.info':
          return getJSON('https://blockstream.info/api/tx/' + txId)
            .then((tx) => {

              if (!tx.status.block_hash) {
                throw new Error('tx_not_confirmed');
              }

              return getJSON('https://blockstream.info/api/blocks/tip/height')
                .then((tipHeight) => {

                  //noinspection JSUnresolvedVariable
                  return getJSON('https://blockstream.info/api/block/' + tx.status.block_hash)
                    .then((block) => {

                      //noinspection JSUnresolvedVariable
                      return makeTransaction(txId, tipHeight - block.height, new Date(block.timestamp * 1000), block.id,
                        ((output) => output ? ((output.scriptpubkey_asm).split(' '))[2] : null)((tx.vout || [])
                          .find((o) => o.hasOwnProperty('scriptpubkey')
                            && o.scriptpubkey_asm
                            && o.scriptpubkey_asm.startsWith('OP_RETURN'))));
                    })
                    .catch((error) => {
                      throw new Error('Failed to get block');
                    });
                })
                .catch((error) => {
                  throw new Error('Failed to get current block height');
                });
            })
            .catch((error) => {
              throw new Error('tx_not_found');
            });
        case 'blockcypher.com':
          return getJSON('https://api.blockcypher.com/v1/btc/main/txs/' + txId)
            .then((tx) => {

              if (tx.error) {
                throw new Error('tx_not_found');
              }

              if (!tx.confirmed || !tx.confirmations) {
                throw new Error('tx_not_confirmed');
              }

              //noinspection JSUnresolvedVariable
              return makeTransaction(tx.hash, tx.confirmations, new Date(tx.confirmed), tx.block_hash,
                ((output) => output ? output.data_hex : null)((tx.outputs || [])
                  .find((o) => o.hasOwnProperty('data_hex'))));
            })
            .catch(() => {
              throw new Error('tx_not_found');
            });
      }
    }
  };

  /**
   * @typedef {{DATA: number, SIGNATURE: number, BOTH: number}} AnchorType
   */

  /**
   * @type {AnchorType}
   */
  const _types = {
    DATA: 1,
    SIGNATURE: 2,
    BOTH: 3
  };

  woleet.anchor = {
    types: _types,

    /**
     * @param {String} hash
     * @param {Type} type
     * @param {Number} size
     * @returns {Promise<AnchorIDsPage>}
     */
    getAnchorIDs: (hash, type, size) => {
      switch (type) {
        case _types.BOTH:
          const a = woleet.anchor.getAnchorIDs(hash, _types.SIGNATURE, size);
          const b = woleet.anchor.getAnchorIDs(hash, _types.DATA, size);
          return Promise.all([a, b])
            .then(([a, b]) => {
              if (a instanceof Error || b instanceof Error)
                throw new Error('http_error');
              return [].concat(a, b);
            });
        case _types.SIGNATURE:
          return getJSON(woleetApiUrl + '/anchorids' + dataToURI({ signedHash: hash, size }))
            .then((res) => res.content || [])
            .catch((error) => {
              throw new Error('http_error')
            });
        case _types.DATA:
        default:
          return getJSON(woleetApiUrl + '/anchorids' + dataToURI({ hash, size }))
            .then((res) => res.content || [])
            .catch(error => {
              throw new Error('http_error')
            });
      }
    },
  };

  /**
   * @param {String} anchorId
   * @returns {Promise<Receipt>}
   */
  woleet.receipt.get = (anchorId) => {
    return getJSON(woleetApiUrl + "/receipt/" + anchorId)
      .catch((error) => {
        if (error.code === 404)
          throw new Error('not_found');
        else
          throw new Error(error.code);
      });
  };

  /**
   * @param {string} identityUrl
   * @param {string} pubKey
   * @param {string } signedIdentity
   * @param {string} leftData
   * @returns {*}
   */
  woleet.identity.get = (identityUrl, pubKey, signedIdentity, leftData) => {
    return getJSON(identityUrl + dataToURI({ pubKey, signedIdentity, leftData }))
      .catch((error) => {
        if (error.code === 404) {
          throw new Error('key_not_found');
        } else if (error.code === 400 || error.code === 0) {
          throw new Error('http_error');
        } else {
          throw new Error(error.code);
        }
      });
  };

  /**
   * @param {Hash} hash
   * @returns {boolean}
   */
  woleet.isSHA256 = (hash) => /^[a-f0-9]{64}$/i.test(hash);

  /**
   * Expose getJSON function.
   */
  woleet.getJSON = getJSON;

  return woleet;
};

