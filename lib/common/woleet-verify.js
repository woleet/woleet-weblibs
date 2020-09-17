module.exports = function (woleet) {

  /**
   * @param {ReceiptVerificationStatus} verification
   * @private
   * @description utility function that extends checks for signature validity
   * @return {Promise.<ReceiptVerificationStatus>}
   */
  function validateSignatureAndIdentity(verification) {

    return Promise.resolve(verification)
      .then((verification) => {

        // If the receipt is a proof of existence: nothing to verify
        const s = verification.receipt.signature;
        if (!s) {
          return verification;
        }

        // Check that mandatory signature fields are all provided
        if (!s.signature || !s.signedHash || !s.pubKey) {
          throw new Error('invalid_receipt_signature_format');
        }

        // Build the message that should have been signed
        let message = s.signedHash;
        if (s.signedIdentity || s.signedIssuerDomain) {
          message = woleet.crypto.sha256()
            .update(s.signedHash + (s.signedIdentity || "") + (s.signedIssuerDomain || ""))
            .digest('hex');
        }

        // Validate the signature of the message
        return woleet.signature.validateSignature(message, s.pubKey, s.signature)
          .then((res) => {

            // If signature is invalid, stop here
            if (!res.valid) {
              throw new Error('invalid_receipt_signature');
            }

            // Validate identity of the public key using the identity URL and the signed identity
            return woleet.signature.validateIdentity(s.identityURL, s.pubKey, s.signedIdentity, s.signedIssuerDomain)
              .then((res) => {
                if (!res.valid) {
                  verification.identityVerificationStatus = {
                    code: res.reason,
                    identity: res.identity,
                    signedIdentity: res.signedIdentity
                  };
                } else {
                  verification.identityVerificationStatus = {
                    code: 'verified',
                    identity: res.identity,
                    signedIdentity: res.signedIdentity
                  };
                }
                return verification;
              })
              .catch((error) => {
                verification.identityVerificationStatus = {
                  code: error.message
                };
                return verification;
              });
          });
      });
  }

  /**
   * @param {Receipt|ReceiptV2} receipt
   * @return {Promise.<ReceiptVerificationStatus>}
   */
  function validateTransaction(receipt) {

    // Get the transaction of the receipt
    const getReceiptTxId = (receipt) => receipt.header && receipt.header.tx_id || receipt.anchors && receipt.anchors.find(e => e.type === "BTCOpReturn").sourceId;

    // Check that receipt's Merkle root matches transaction's OP_RETURN
    return woleet.transaction.get(getReceiptTxId(receipt))
      .then((tx) => {
        if (tx.opReturn === (receipt.header && receipt.header.merkle_root || receipt.merkleRoot)) {

          // If we have a match, return the receipt, the transaction timestamp and the number of confirmation
          return {
            receipt: receipt,
            confirmations: tx.confirmations,
            timestamp: tx.timestamp,
            code: 'verified'
          };
        } else {
          throw new Error('op_return_mismatches_merkle_root');
        }
      });
  }

  /**
   * @param {Receipt|ReceiptV2} receipt
   * @param {Hash} hash
   */
  function compareTargetHash(receipt, hash) {
    if (receipt.signature) {
      if (receipt.signature.signedHash !== hash) {
        throw new Error("target_hash_mismatch");
      }
    } else {
      if ((receipt.target && receipt.target.target_hash || receipt.targetHash) !== hash) {
        throw new Error("target_hash_mismatch");
      }
    }
  }

  /**
   * @param {File|String} file
   * @param {Function} [progressCallback]
   * @returns {Promise.<ReceiptVerificationStatus[]>}
   */
  function WoleetDAB(file, progressCallback) {

    // Hash to file or check the hash
    return woleet.file.hashFileOrCheckHash(file, progressCallback)

      // We got the hash
      .then((hash) => {

        // Now, get all corresponding public anchor ids
        return woleet.anchor.getAnchorIDs(hash, woleet.anchor.types.BOTH)
      })

      // We got all public anchor ids
      .then((anchorIDArray) => {

        // Now, get all the corresponding receipts
        const receiptArray = [];
        return anchorIDArray
          .reduce((chain, anchorId) => {
            return chain
              .then(() => {
                return woleet.receipt.get(anchorId)
                  .then((receipt) => {
                    receiptArray.push(receipt);
                  })
                  .catch((error) => {

                    // If we cannot get the corresponding receipt for this anchor because
                    // it's not yet processed (202) we ignore this element, else we forward error
                    if (error.message !== '202') {
                      throw error;
                    }
                  });
              });
          }, Promise.resolve())

          // Forward the receipt array
          .then(() => {

            // If we found some anchors but cannot get any receipt, it means that anchors are not yet processed
            if (anchorIDArray.length && !receiptArray.length) {
              throw new Error('file_matched_but_anchor_not_yet_processed')
            }
            /** @type Array<Receipt|ReceiptV2> */
            return receiptArray;
          });
      })

      // We got all receipts
      .then((receiptArray) => {

        // Now, get all receipt verification status
        const finalArray = [];
        return receiptArray
          .reduce((chain, receipt) => {
            return chain
              .then(() => {
                return verifyReceipt(receipt)
                  .then((validation) => {
                    finalArray.push(validation)
                  })
                  .catch((error) => {
                    finalArray.push({ receipt, code: error.message })
                  });
              })
          }, Promise.resolve())

          // Forward receipt verification status sorted by timestamp
          .then(() => {
            return finalArray.sort((a, b) => {
              if (!a.timestamp)
                return 1;
              if (!b.timestamp)
                return -1;
              if (a.timestamp && b.timestamp) {
                return a.timestamp.getTime() - b.timestamp.getTime();
              }
              return 0;
            });
          })
      });
  }

  /**
   * @param {File|String} file
   * @param {Receipt|ReceiptV2} receipt
   * @param {Function} [progressCallback]
   * @returns {Promise.<ReceiptVerificationStatus>}
   */
  function DAB(file, receipt, progressCallback) {
    return woleet.file.hashFileOrCheckHash(file, progressCallback)
      .then((hash) => verifyReceipt(receipt, hash));
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
      .then(() => validateTransaction(receipt))
      .then(validateSignatureAndIdentity)
      .catch((error) => {
        return { receipt, code: error.message };
      });
  }

  return {
    WoleetDAB,
    DAB,
    receipt: verifyReceipt
  };
};
