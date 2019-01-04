module.exports = function (hashFileOrCheckHash) {

  /**
   * @param {ReceiptVerificationStatus} verification
   * @private
   * @description utility function that extends checks for signature validity
   * @return {Promise.<ReceiptVerificationStatus>}
   */
  function validateSignature(verification) {
    return Promise.resolve(verification)
      .then((result) => {
        if (result.receipt.signature) {
          const s = result.receipt.signature;

          if (!s.signature || !s.signedHash || !s.pubKey)
            throw new Error('invalid_receipt_signature_format');

          return Promise.resolve(result)
            .then((result) => {
              return woleet.signature.validateSignature(s.signedHash, s.pubKey, s.signature)
                .then(({ valid }) => {
                  if (!valid) {
                    throw new Error('invalid_receipt_signature');
                  }
                  return result;
                })
            })
            .then((result) => {
              if (s.identityURL) {
                return woleet.signature.validateIdentity(s.identityURL, s.pubKey)
                  .then((res) => {
                    if (!res.valid) {
                      result.identityVerificationStatus = {
                        code: 'invalid_signature',
                        identity: res.identity
                      }
                    }
                    else {
                      result.identityVerificationStatus = {
                        code: 'verified',
                        identity: res.identity
                      }
                    }
                  })
                  .catch(({ message: code }) => {
                    result.identityVerificationStatus = { code };
                  })
                  .then(() => result);
              }
              else return result;
            });
        }
        else {
          return result;
        }
      })
  }

  /**
   * @param {Receipt|ReceiptV2} receipt
   * @return {Promise.<ReceiptVerificationStatus>}
   */
  function getReceiptInformation(receipt) {
    const getReceiptTxId = (receipt) => receipt.header && receipt.header.tx_id || receipt.anchors && receipt.anchors.find(e => e.type === "BTCOpReturn").sourceId;
    // Get the transaction
    return woleet.transaction.get(getReceiptTxId(receipt))
      .catch((error) => {
        throw error;
      })
      // We got the transaction
      .then((tx) => {
        // Check that receipt's Merkle root matches transaction's OP_RETURN
        if (tx.opReturn === (receipt.header && receipt.header.merkle_root || receipt.merkleRoot)) {
          // Return the result
          return {
            receipt: receipt,
            confirmations: tx.confirmations,
            timestamp: tx.timestamp,
            code: 'verified'
          };
        }
        else
          throw new Error('op_return_mismatches_merkle_root')
      })
  }

  /**
   * @param {Receipt|ReceiptV2} receipt
   * @param {Hash} hash
   */
  function compareTargetHash(receipt, hash) {
    if (receipt.signature) {
      if (receipt.signature.signedHash !== hash) throw new Error("target_hash_mismatch");
    }
    else {
      if ((receipt.target && receipt.target.target_hash || receipt.targetHash) !== hash) throw new Error("target_hash_mismatch");
    }
  }

  /**
   * @param {File|String} file
   * @param {Function} [progressCallback]
   * @returns {Promise.<ReceiptVerificationStatus[]>}
   */
  function WoleetDAB(file, progressCallback) {

    let _hash = null;

    return hashFileOrCheckHash(file, progressCallback)

    // We got the hash, now we get all corresponding public anchors ids
      .then((hash) => {
        _hash = hash;
        return woleet.anchor.getAnchorIDs(hash, woleet.anchor.types.BOTH)
      })

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

        // Forward the receipt array
          .then(() => {
            // If we had a match but can't get a receipt
            if (!receiptArray.length && anchorIDs.length) {
              throw new Error('file_matched_but_anchor_not_yet_processed')
            }
            /** @type Array<Receipt|ReceiptV2> */
            return receiptArray;
          });
      })

      // We got all public anchor receipts
      .then((receiptArray) => {
        const finalArray = [];
        // For each receipt we got
        return receiptArray
        // Build the result array
          .reduce((chain, receipt) => {
            return chain.then(() => {
              return verifyReceipt(receipt)
                .then((validation) => {
                  finalArray.push(validation)
                })
                .catch(({ message: code }) => {
                  finalArray.push({ receipt, code })
                });
            })
          }, Promise.resolve())
          // We got an array of object with {receipt, confirmations, timestamp}, so we forward it
          .then(() => finalArray)
      })
  }

  /**
   * @param {File|String} file
   * @param {Receipt|ReceiptV2} receipt
   * @param {Function} [progressCallback]
   * @returns {Promise.<ReceiptVerificationStatus>}
   */
  function DAB(file, receipt, progressCallback) {
    return hashFileOrCheckHash(file, progressCallback)
      .then((hash) => verifyReceipt(receipt, hash))
  }

  /**
   * @param {Receipt|ReceiptV2} receipt
   * @param {Hash} [hash]
   * @returns {Promise.<ReceiptVerificationStatus>}
   */
  function verifyReceipt(receipt, hash) {
    return Promise.resolve()
      .then(() => woleet.receipt.validate(receipt))
      .then(() => {
        if (hash) compareTargetHash(receipt, hash);
      })
      .then(() => getReceiptInformation(receipt))
      .then(validateSignature)
      .catch(({ message: code }) => {
        return { receipt, code };
      })
  }

  return {
    WoleetDAB,
    DAB,
    receipt: verifyReceipt
  };

};
