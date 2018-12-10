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

/**
 * @param woleet
 * @param getJSON
 * @return {{}}
 */
module.exports = function (getJSON) {

  // const woleet = Object.assign({receipt: {}});
  const woleet = {receipt: {}};

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
      if (data[prop]) _data.push(
        [encodeURIComponent(prop), encodeURIComponent(data[prop])].join('=')
      );
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

  const WOLEET_API_URL = "https://api.woleet.io/v1";

  const DEFAULT_TRANSACTION_PROVIDER = 'woleet.io';
  let transactionProvider = DEFAULT_TRANSACTION_PROVIDER;

  woleet.transaction = {

    /**
     * @param provider
     */
    setDefaultProvider: (provider) => {
      switch (provider) {
        case 'blockcypher.com':
        case 'woleet.io':
        case 'chain.so':
          transactionProvider = provider;
          break;
        default:
          transactionProvider = DEFAULT_TRANSACTION_PROVIDER;
          break;
      }
    },

    /**
     * @param txId
     * @returns {Promise.<Transaction>}
     */
    get: function (txId) {
      switch (transactionProvider) {
        case 'woleet.io':
          return getJSON(WOLEET_API_URL + '/bitcoin/transaction/' + txId)
            .then((res) => {
              if (!res) {
                throw new Error('tx_not_found');
              }
              else {
                //noinspection JSUnresolvedVariable
                return makeTransaction(res.txid, res.confirmations, new Date(res.time * 1000), res.blockhash || 0,
                  ((output) => output ? ((output.scriptPubKey.asm).split(' '))[1] : null)((res.vout || [])
                    .find((o) => o.hasOwnProperty('scriptPubKey')
                      && o.scriptPubKey.hasOwnProperty('asm')
                      && o.scriptPubKey.asm.startsWith('OP_RETURN'))));
              }
            });
        case 'chain.so':
          return getJSON('https://chain.so/api/v2/get_tx/BTC/' + txId)
            .then((res) => {
              if (!res || res.status === 'fail') {
                throw new Error('tx_not_found');
              }
              else {
                //noinspection JSUnresolvedVariable
                return makeTransaction(res.data.txid, res.data.confirmations, new Date(res.data.time * 1000), res.data.blockhash,
                  ((output) => output ? ((output.script).split(' '))[1] : null)((res.data.outputs || [])
                    .find((o) => o.hasOwnProperty('script') && o.script.startsWith('OP_RETURN'))));
              }
            });
        case 'blockcypher.com':
          return getJSON('https://api.blockcypher.com/v1/btc/main/txs/' + txId)
            .then((res) => {
              if (!res || res.error) {
                throw new Error('tx_not_found');
              }
              else {
                //noinspection JSUnresolvedVariable
                return makeTransaction(res.hash, res.confirmations, new Date(res.confirmed), res.block_hash,
                  ((output) => output ? output.data_hex : null)((res.outputs || [])
                    .find((o) => o.hasOwnProperty('data_hex'))));
              }
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
    FILE_HASH: 1, // for backward compatibility
    DATA: 1,
    SIGNATURE: 2,
    BOTH: 3
  };

  /**
   * @param {String} hash
   * @param {Number} [size]
   * @returns {Promise<AnchorIDsPage>}
   */
  woleet.anchor = {
    types: _types,
    getAnchorIDs: (hash, type, size = 20) => {
      switch (type) {
        case _types.BOTH:
          const a = woleet.anchor.getAnchorIDs(hash, _types.SIGNATURE, size);
          const b = woleet.anchor.getAnchorIDs(hash, _types.DATA, size);
          return Promise.all([a, b]).then(([a, b]) => [].concat(a, b));
        case _types.SIGNATURE:
          return getJSON(WOLEET_API_URL + '/anchorids' + dataToURI({ signedHash: hash, size }))
            .then((res) => res.content || []);
        case _types.DATA:
        default:
          return getJSON(WOLEET_API_URL + '/anchorids' + dataToURI({ hash, size }))
            .then((res) => res.content || []);
      }
    },
  };

  /**
   * @param {String} anchorId
   * @returns {Promise<Receipt>}
   */
  woleet.receipt.get = (anchorId) => getJSON(WOLEET_API_URL + "/receipt/" + anchorId).then((res) => {
    if (!res) {
      throw new Error('not_found');
    }
    else {
      return res;
    }
  });

  woleet.identity = {
    getRandomSignature: (identityUrl, pubKey, leftData) => getJSON(identityUrl + dataToURI({ pubKey, leftData }))
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
