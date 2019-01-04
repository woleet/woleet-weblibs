/**
 * @namespace woleet
 */

/** @type {Receipt} */
const validReceipt = {
  "header": {
    "chainpoint_version": "1.0",
    "hash_type": "SHA-256",
    "merkle_root": "bf53f456227b377527349f337b8d11687e461a6ff01790deadb862bf1fa57fe9",
    "tx_id": "0e50313029143187a44bf9fa9b9f08bf1b349291787ad8eeec2d09a2a5aaa1c5",
    "timestamp": 1479831225
  },
  "target": {
    "target_hash": "0bf8e69866ff5db9efc108ea87953081ba627fb524a2c457dfb6c1b7df9430f9",
    "target_uri": "null",
    "target_proof": [
      {
        "parent": "275036918865f2bc25da43487e9d6d24a59b730753758935a68d8b8f2d27cdc5",
        "left": "0bf8e69866ff5db9efc108ea87953081ba627fb524a2c457dfb6c1b7df9430f9",
        "right": "259debf1b85cb6c962349945be88d504f2a79dbf0771c93fc5c76c5afad15794"
      },
      {
        "parent": "9022cfc24650e3efbafa648e3b930b58ee0db0686ce7d0717f9f81be7ee45f2c",
        "left": "307a39911f22f16d7d97e6d66168ff65a49b6c07825cdceb0e6f5907d87fe9f4",
        "right": "275036918865f2bc25da43487e9d6d24a59b730753758935a68d8b8f2d27cdc5"
      },
      {
        "parent": "bf53f456227b377527349f337b8d11687e461a6ff01790deadb862bf1fa57fe9",
        "left": "9022cfc24650e3efbafa648e3b930b58ee0db0686ce7d0717f9f81be7ee45f2c",
        "right": "31ec828ab1de576e8ae5f711d42aa28c59f0bb9242d23c27b9d12448e0e1cfee"
      }
    ]
  },
  "extra": [
    {
      "size": "93259"
    },
    {
      "type": "application/pdf"
    },
    {
      "anchorid": "c2f25d10-eae5-413c-82eb-1bdb6cf499b6"
    }
  ]
};

/** @type {Receipt} */
const emptyFileValidReceipt = {
  "header": {
    "chainpoint_version": "1.0",
    "hash_type": "SHA-256",
    "merkle_root": "628968521ab483a75de893f6a27132bae3ea55384c67f22ebb94199d07e0878e",
    "tx_id": "276d833587ab60471811e0d403a5bac442ccefaf980d5b50f95f1193f04af5a2",
    "timestamp": 1477506128
  },
  "target": {
    "target_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "target_uri": "null",
    "target_proof": [
      {
        "parent": "628968521ab483a75de893f6a27132bae3ea55384c67f22ebb94199d07e0878e",
        "left": "764b64442f530395050237e09a646ee81b5798915e47818f5c5d1053773ca80b",
        "right": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      }
    ]
  },
  "extra": [
    {
      "anchorid": "616980d1-7672-4558-b101-6c94bf7cee41"
    }
  ]
};

/** @type {Receipt} */
const emptyFileValidSignedReceipt = {
  "header": {
    "chainpoint_version": "1.0",
    "merkle_root": "76280be77b005ee3a4e61a3301717289362e1a9106343c7afba21b55be33b39b",
    "tx_id": "01b321351b6a1dd315e08d5613c68c2cafc36e76239b9c3f3aced5e72194bded",
    "hash_type": "SHA-256",
    "timestamp": 1497625706
  },
  "extra": [
    {
      "size": "0"
    },
    {
      "anchorid": "561920c1-68a0-468e-82c9-982e7c4b1c63"
    }
  ],
  "signature": {
    "signature": "HxVxyhfiJ1EyEDlhXidshWs3QQxb3JUcAvKpt1NLMonLXWWKXL39OLH3XXGofTho5JKjrZUY32sRoX6g2mh/Os0=",
    "signedHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "pubKey": "19itkAbBMnjpC8xL4nHWWebgANEGUS2coQ"
  },
  "target": {
    "target_hash": "626484929addc065a418b5a036642f30f6995945c3c75c7003c1ce2779d96a6b",
    "target_proof": [
      {
        "parent": "568cf14e36229a6b81fa19b49c46a4ab36629d154572151af869619c225fa289",
        "left": "626484929addc065a418b5a036642f30f6995945c3c75c7003c1ce2779d96a6b",
        "right": "7bf003add22b5472106cbd92467dd09b1bafd2c14b53337c8f5f0cb3b73d8712"
      },
      {
        "parent": "1b79f991a650f97ca1f6e391aa5850894b9d8c4c3151c1c4ee58dc1429abe478",
        "left": "2d626ed118e1d84929f5977f8c4eb1cfb77459a8d6ea4b141e7e8651dcb48e5c",
        "right": "568cf14e36229a6b81fa19b49c46a4ab36629d154572151af869619c225fa289"
      },
      {
        "parent": "229f9863f84f095584b6b1f043b59b51934666d0100475c8f814455b2f87d3e8",
        "left": "1b79f991a650f97ca1f6e391aa5850894b9d8c4c3151c1c4ee58dc1429abe478",
        "right": "03926260dcb98d387fe560e6032ce012938cd18cddc25283a01de8ecef98feb3"
      },
      {
        "parent": "76280be77b005ee3a4e61a3301717289362e1a9106343c7afba21b55be33b39b",
        "left": "229f9863f84f095584b6b1f043b59b51934666d0100475c8f814455b2f87d3e8",
        "right": "8c6d7d8fa5a4418d79ef9699af0a58bc63a43f603e0f41533b743ba656a76fcf"
      }
    ]
  }
};

/** @type {ReceiptV2} */
const validReceiptV2 = {
  "targetHash": "8de1de49d84480c8d0142ee23d82595d5046a40e3958b4161ac37cb75d7ef0da",
  "signature": {
    "signature": "H5aUT2noAzB7CeT0YTgIpcEx1xQ1KhBetYoewDVDrImgEYgSUKTg/5v0wbVfY4tky3EJyWgYH1PwFrwosfgE670=",
    "signedHash": "b8f0ccf1484379c957bb1a2d1806998e2662ebde731266dbd9b953d59fd81a5b",
    "pubKey": "1BGLkyG7SCHH32bALDnMP2YrS84JMCimc3"
  },
  "merkleRoot": "9a094a28c667633c6e6868124a694673cc8b440ab1a8205dad748c6a4455e8d9",
  "proof": [
    {
      "right": "dda086255a9d62e90a791307de7aa1bdb973333f8da8ac53f402b9d72db8d9d9"
    }
  ],
  "anchors": [
    {
      "sourceId": "cf85e40a989414fcba072434fbead5d7b51899c95e63bdc641561294fbaf7687",
      "type": "BTCOpReturn"
    }
  ],
  "type": "ChainpointSHA256v2",
  "@context": "https://w3id.org/chainpoint/v2"
};

/** @type {ReceiptV2} */
const validReceiptV22 = {
  "@context": "https://w3id.org/chainpoint/v2",
  "type": "ChainpointSHA256v2",
  "targetHash": "bdf8c9bdf076d6aff0292a1c9448691d2ae283f2ce41b045355e2c8cb8e85ef2",
  "merkleRoot": "51296468ea48ddbcc546abb85b935c73058fd8acdb0b953da6aa1ae966581a7a",
  "proof": [
    {
      "left": "bdf8c9bdf076d6aff0292a1c9448691d2ae283f2ce41b045355e2c8cb8e85ef2"
    },
    {
      "left": "cb0dbbedb5ec5363e39be9fc43f56f321e1572cfcf304d26fc67cb6ea2e49faf"
    },
    {
      "right": "cb0dbbedb5ec5363e39be9fc43f56f321e1572cfcf304d26fc67cb6ea2e49faf"
    }
  ],
  "anchors": [
    {
      "type": "BTCOpReturn",
      "sourceId": "f3be82fe1b5d8f18e009cb9a491781289d2e01678311fe2b2e4e84381aafadee"
    }
  ]
};

Object.freeze(validReceipt);

function safeCopy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function nofail(fn) {
  try {
    return fn();
  } catch (err) {
    console.warn(err);
    return null;
  }
}

let PolyBlob, PolyFile;

if (typeof window === 'undefined') {
  const stream = require('stream');
  const woleet = global.woleet = require('../index');
  PolyBlob = function ([string]) {
    return Buffer.from(string, 'utf-8')
  };
  PolyFile = function ([blob]) {
    return blob;
  };
}
else {
  PolyBlob = window.Blob;
  PolyFile = window.File;
  Buffer = woleet.crypto.Buffer;
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

// Force the blockchain provider (default is woleet.io)
//woleet.transaction.setDefaultProvider('woleet.io');
//woleet.transaction.setDefaultProvider('blockstream.info');
//woleet.transaction.setDefaultProvider('blockcypher.com');

describe("isSHA256 suite", function () {
  it('isSHA256("789") should be false', function () {
    const result = woleet.isSHA256('789');
    expect(result).toBe(false);
  });

  it('isSHA256(789) should be false', function () {
    //noinspection JSCheckFunctionSignatures
    const result = woleet.isSHA256(789);
    expect(result).toBe(false);
  });

  it('isSHA256("abcdef123456789") should be false', function () {
    const result = woleet.isSHA256("abcdef123456789");
    expect(result).toBe(false);
  });

  it('isSHA256 with good length but wrong character should be false', function () {
    const result = woleet.isSHA256("4b4a6eff59b5d297b7f68ffa0603268e0550dd03845cf0b89ad5cd53cb564a2q");
    expect(result).toBe(false);
  });

  it('isSHA256 with valid SHA256 hash should be true', function () {
    const result = woleet.isSHA256("4b4a6eff59b5d297b7f68ffa0603268e0550dd03845cf0b89ad5cd53cb564a23");
    expect(result).toBe(true);
  });
});

describe("short hash suite", function () {

  const sha224 = woleet.crypto.sha224;
  const sha256 = woleet.crypto.sha256;
  const sha384 = woleet.crypto.sha384;
  const sha512 = woleet.crypto.sha512;

  it('should correctly perform a sha224 on string', function () {
    const r1 = sha224().update("").digest();
    const r2 = sha224().update(r1).digest('hex');
    const r3 = sha224().update(r1.toString('hex')).digest('hex');
    expect(r1.toString('hex')).toEqual("d14a028c2a3a2bc9476102bb288234c415a2b01f828ea62ac5b3e42f");
    expect(r2).toEqual("4126b5221637da7df60d24eaa2822a0a1a19a4c2c4cfa7f1034475be"); // r1 hex parsed
    expect(r3).toEqual("9350828c49590226348a43854e9deb42ab802d4291b71d06166e38a4"); // r1 as utf-8
  });

  it('should correctly perform a sha224 on Buffer', function () {
    const r1 = sha224().update(new Buffer('')).digest('hex');
    const r2 = sha224().update(r1, 'hex').digest('hex');
    const r3 = sha224().update(r1).digest('hex');
    expect(r1).toEqual("d14a028c2a3a2bc9476102bb288234c415a2b01f828ea62ac5b3e42f");
    expect(r2).toEqual("4126b5221637da7df60d24eaa2822a0a1a19a4c2c4cfa7f1034475be"); // r1 hex parsed
    expect(r3).toEqual("9350828c49590226348a43854e9deb42ab802d4291b71d06166e38a4"); // r1 as utf-8
  });

  it('should correctly perform a sha224 on binary string', function () {
    const r1 = sha224().update(new Buffer('')).digest('binary');
    const r2 = sha224().update(r1, 'binary').digest('hex');
    const r22 = sha224().update(new Buffer(r1, 'binary')).digest('hex');
    const r3 = sha224().update(new Buffer(r1, 'binary').toString('hex'), 'utf8').digest('hex');
    const r32 = sha224().update(new Buffer(r1, 'binary').toString('hex')).digest('hex');
    const r4 = sha224().update(new Buffer(r1, 'binary').toString('base64'), 'base64').digest('hex');
    expect(new Buffer(r1, 'binary').toString('hex')).toEqual("d14a028c2a3a2bc9476102bb288234c415a2b01f828ea62ac5b3e42f");
    expect(r2).toEqual("4126b5221637da7df60d24eaa2822a0a1a19a4c2c4cfa7f1034475be"); // r1 hex parsed
    expect(r2).toEqual(r22);
    expect(r3).toEqual("9350828c49590226348a43854e9deb42ab802d4291b71d06166e38a4"); // r1 as utf-8
    expect(r3).toEqual(r32);
    expect(r4).toEqual("4126b5221637da7df60d24eaa2822a0a1a19a4c2c4cfa7f1034475be"); // r1 hex parsed
  });

  it('should correctly perform a sha256 on string', function () {
    const r1 = sha256().update("").digest();
    const r2 = sha256().update(r1).digest('hex');
    const r3 = sha256().update(r1.toString('hex')).digest('hex');
    expect(r1.toString('hex')).toEqual("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    expect(r2).toEqual("5df6e0e2761359d30a8275058e299fcc0381534545f55cf43e41983f5d4c9456"); // r1 hex parsed
    expect(r3).toEqual("cd372fb85148700fa88095e3492d3f9f5beb43e555e5ff26d95f5a6adc36f8e6"); // r1 as utf-8
  });

  it('should correctly perform a sha256 on Buffer', function () {
    const r1 = sha256().update(new Buffer('')).digest('hex');
    const r2 = sha256().update(new Buffer(r1, 'hex')).digest('hex');
    const r3 = sha256().update(r1).digest('hex');
    expect(r1.toString('hex')).toEqual("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    expect(r2).toEqual("5df6e0e2761359d30a8275058e299fcc0381534545f55cf43e41983f5d4c9456"); // r1 hex parsed
    expect(r3).toEqual("cd372fb85148700fa88095e3492d3f9f5beb43e555e5ff26d95f5a6adc36f8e6"); // r1 as utf-8
  });

  it('should correctly perform a sha384 on string', function () {
    const r1 = sha384().update("").digest();
    const r2 = sha384().update(r1).digest('hex');
    const r3 = sha384().update(r1.toString('hex')).digest('hex');
    expect(r1.toString('hex')).toEqual("38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b");
    expect(r2).toEqual("b035c6baed2533e26bda63b69d2e45daa9d14ecdf7118feb40e912d14b4355114c00f3989e07a23aeacbf07e9872f7db"); // r1 hex parsed
    expect(r3).toEqual("7e4a22bac84bf4653c27cf66fdbfc94b1f7aa38fda6777d60b2598ea5a353af6e6091bd1e1c789209548a4f1e16c0f55"); // r1 as utf-8
  });

  it('should correctly perform a sha384 on Buffer', function () {
    const r1 = sha384().update(new Buffer('')).digest('hex');
    const r2 = sha384().update(new Buffer(r1, 'hex')).digest('hex');
    const r3 = sha384().update(r1).digest('hex');
    expect(r1.toString('hex')).toEqual("38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b");
    expect(r2).toEqual("b035c6baed2533e26bda63b69d2e45daa9d14ecdf7118feb40e912d14b4355114c00f3989e07a23aeacbf07e9872f7db"); // r1 hex parsed
    expect(r3).toEqual("7e4a22bac84bf4653c27cf66fdbfc94b1f7aa38fda6777d60b2598ea5a353af6e6091bd1e1c789209548a4f1e16c0f55"); // r1 as utf-8
  });

  it('should correctly perform a sha512 on string', function () {
    const r1 = sha512().update("").digest();
    const r2 = sha512().update(r1).digest('hex');
    const r3 = sha512().update(r1.toString('hex')).digest('hex');
    expect(r1.toString('hex')).toEqual("cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e");
    expect(r2).toEqual("826df068457df5dd195b437ab7e7739ff75d2672183f02bb8e1089fabcf97bd9dc80110cf42dbc7cff41c78ecb68d8ba78abe6b5178dea3984df8c55541bf949"); // r1 hex parsed
    expect(r3).toEqual("8fb29448faee18b656030e8f5a8b9e9a695900f36a3b7d7ebb0d9d51e06c8569d81a55e39b481cf50546d697e7bde1715aa6badede8ddc801c739777be77f166"); // r1 as utf-8
  });

  it('should correctly perform a sha512 on Buffer', function () {
    const r1 = sha512().update(new Buffer('')).digest('hex');
    const r2 = sha512().update(new Buffer(r1, 'hex')).digest('hex');
    const r3 = sha512().update(r1).digest('hex');
    expect(r1.toString('hex')).toEqual("cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e");
    expect(r2).toEqual("826df068457df5dd195b437ab7e7739ff75d2672183f02bb8e1089fabcf97bd9dc80110cf42dbc7cff41c78ecb68d8ba78abe6b5178dea3984df8c55541bf949"); // r1 hex parsed
    expect(r3).toEqual("8fb29448faee18b656030e8f5a8b9e9a695900f36a3b7d7ebb0d9d51e06c8569d81a55e39b481cf50546d697e7bde1715aa6badede8ddc801c739777be77f166"); // r1 as utf-8
  });

});

describe("receipt.validate suite", function () {

  it('valid receipt should be valid', function () {
    const result = woleet.receipt.validate(validReceipt);
    expect(result).toBe(true);
  });

  it('receipt.validate without param should throw invalid_receipt_format', function () {
    //noinspection JSCheckFunctionSignatures
    const result = () => woleet.receipt.validate();
    expect(result).toThrowError('invalid_receipt_format');
  });

  it('receipt.validate("789") should throw invalid_receipt_format', function () {
    const result = () => woleet.receipt.validate('789');
    expect(result).toThrowError('invalid_receipt_format');
  });

  it('receipt.validate with missing target should throw invalid_receipt_format', function () {
    const invalidReceipt = safeCopy(validReceipt);
    delete invalidReceipt['target'];
    const result = () => woleet.receipt.validate(invalidReceipt);
    expect(result).toThrowError('invalid_receipt_format');
  });

  it('receipt.validate without param should throw invalid_receipt_format', function () {
    //noinspection JSCheckFunctionSignatures
    const result = () => woleet.receipt.validate();
    expect(result).toThrowError('invalid_receipt_format');
  });

  it('receipt.validate with missing proof element should throw invalid_target_proof', function () {
    const invalidReceipt = safeCopy(validReceipt);
    delete invalidReceipt.target.target_proof[0].left;
    const result = () => woleet.receipt.validate(invalidReceipt);
    expect(result).toThrowError('invalid_target_proof');
  });

  it('receipt.validate with non-sha256 proof element should throw non_sha256_target_proof_element', function () {
    const invalidReceipt = safeCopy(validReceipt);
    invalidReceipt.target.target_proof[0].left = "asx";
    const result = () => woleet.receipt.validate(invalidReceipt);
    expect(result).toThrowError('non_sha256_target_proof_element');
  });

  it('receipt.validate with bad proof element should throw invalid_parent_in_proof_element', function () {
    const invalidReceipt = safeCopy(validReceipt);
    invalidReceipt.target.target_proof[0].left = "4715c9d59d8cc7f006c086997ac2c10b8081bc32e374262877299c8cd1f06dca";
    const result = () => woleet.receipt.validate(invalidReceipt);
    expect(result).toThrowError('invalid_parent_in_proof_element');
  });

  // CHAINPOINT 2

  it('valid chainpoint 2 receipt should be valid', function () {
    const result = woleet.receipt.validate(validReceiptV2);
    expect(result).toBe(true);
  });

  it('invalid chainpoint 2 receipt should not be valid', function () {
    const invalidReceiptV2 = safeCopy(validReceiptV2);
    invalidReceiptV2.proof[0].right = 'eda086255a9d62e90a791307de7aa1bdb973333f8da8ac53f402b9d72db8d9d9';
    const result = () => woleet.receipt.validate(invalidReceiptV2);
    expect(result).toThrowError('merkle_root_mismatch');
  });

  it('invalid chainpoint 2 receipt should not be valid', function () {
    const invalidReceiptV22 = safeCopy(validReceiptV22);
    invalidReceiptV22.proof[0].left = 'ddf8c9bdf076d6aff0292a1c9448691d2ae283f2ce41b045355e2c8cb8e85ef2';
    const result = () => woleet.receipt.validate(invalidReceiptV22);
    expect(result).toThrowError('merkle_root_mismatch');
  });
});

describe("transaction.get suite", function () {

  genTest('woleet.io');
  genTest('blockstream.info');
  genTest('blockcypher.com');

  function genTest(provider) {
    describe(provider, function () {

      // Wait one second after each test not to exceed the API limit
      afterEach((done) => setInterval(done, 1000));

      it('transaction.get with valid tx id should return transaction object', (done) => {
        woleet.transaction.setDefaultProvider(provider);
        woleet.transaction.get(validReceipt.header.tx_id)
          .then((tx) => {
            expect(tx.blockHash).toEqual("00000000000000000276fb1e87fa581e09d943f198a8b9114167df0e2230c247");
            expect(tx.opReturn).toEqual(validReceipt.header.merkle_root);
            expect(tx.confirmations).toBeGreaterThan(4500);
            expect(tx.timestamp instanceof Date).toBe(true);
          })
          .catch(noErrorExpected)
          .then(done);
      });

      it('transaction.get with invalid tx id should throw "tx_not_found"', (done) => {
        woleet.transaction.setDefaultProvider(provider);
        woleet.transaction.get('invalid_tx')
          .then((tx) => expect(tx).toBeUndefined())
          .catch((error) => {
            expect(error instanceof Error).toBe(true);
            expect(error.message).toBe('tx_not_found');
          })
          .then(done);
      });

      it('transaction.get with unknown tx id should throw "tx_not_found"', (done) => {
        woleet.transaction.setDefaultProvider(provider);
        woleet.transaction.get('invalid_tx')
          .then((tx) => expect(tx).toBeUndefined())
          .catch((error) => {
            expect(error instanceof Error).toBe(true);
            expect(error.message).toBe('tx_not_found');
          })
          .then(done);
      });

      it('non-existing transaction should throw "tx_not_found"', (done) => {
        woleet.transaction.setDefaultProvider(provider);
        woleet.transaction.get('0e50313029143187a44bf9fa9b9f08bf1b349291787ad8eeec2d09a2a5aaa1c4')
          .then(noResultExpected)
          .catch((error) => {
            expect(error instanceof Error).toBe(true);
            expect(error.message).toBe('tx_not_found');
          })
          .then(done);
      });

      it('transaction.get without parameter should return an error', (done) => {
        woleet.transaction.setDefaultProvider(provider);
        woleet.transaction.get()
          .then(noResultExpected)
          .catch((error) => {
            expect(error instanceof Error).toBe(true);
            expect(error.message).toBe('tx_not_found');
          })
          .then(done);
      });
    });
  }

  afterAll(() => {
    // We reset default provider to woleet.io as the others can be stingy on request limit
    woleet.transaction.setDefaultProvider('woleet.io');
  })
});

describe("receipt.get suite", function () {

  it('receipt.get with valid anchor id should return valid receipt', (done) => {
    woleet.receipt.get("c2f25d10-eae5-413c-82eb-1bdb6cf499b6")
      .then((receipt) => expect(woleet.receipt.validate(receipt)).toBe(true))
      .catch(noErrorExpected)
      .then(done);
  });

  it('receipt.get with unknown anchor id should return "not_found"', (done) => {
    woleet.receipt.get('invalid_anchor_id')
      .then((tx) => expect(tx).toBeUndefined())
      .catch((error) => {
        expect(error instanceof Error).toBe(true);
        expect(error.message).toBe("not_found");
      })
      .then(done);
  });
});

describe("anchor.getAnchorIDs suite", function () {

  it('anchor.getAnchorIDs with invalid file hash should return an error', (done) => {
    woleet.anchor.getAnchorIDs('invalid_tx')
      .then((resultPage) => expect(resultPage).toBeUndefined())
      .catch((error) => expect(error instanceof Error).toBe(true))
      .then(done);
  });

  it('anchor.getAnchorIDs with invalid page size should return an error', (done) => {
    woleet.anchor.getAnchorIDs('invalid_tx', 1, -1)
      .then((resultPage) => expect(resultPage).toBeUndefined())
      .catch((error) => expect(error instanceof Error).toBe(true))
      .then(done);
  });

  it('anchor.getAnchorIDs with unknown file hash should return empty list', (done) => {
    woleet.anchor.getAnchorIDs(woleet.crypto.sha256().update("unknown_data").digest('hex'))
      .then((resultPage) => expect(resultPage.length).toEqual(0))
      .catch(noErrorExpected)
      .then(done);
  });
});

describe("hasher suite", function () {
  const blob = new PolyBlob(['abcdef123456789']);
  const file = nofail(() => new PolyFile([blob], "image.png", { type: "image/png" }));

  testHasher('hasher with valid file should return valid hash', file, "a888e3c6de1f90d12f889952c0c7d0ac230e9014189914f65c548b8a3b44ef45");

  const midBlob = new PolyBlob([(() => {
    let r = '', i = 1e6;
    while (i--) r += 'abcdef123456789';
    return r;
  })()]);

  const midFile = nofail(() => new PolyFile([midBlob], "image.png", { type: "image/png" }));

  testHasher('hasher with valid 1MB file should return valid hash', midFile, "0c3185d8e1b4370037d32f2c30eb163dbd8d95733fe59f8cc45fdee468ee0544");

  function testHasher(name, file, expectation) {
    it(name, (done) => {
      const hasher = new woleet.file.Hasher;
      expect(hasher.isReady()).toBe(true);

      hasher.on('start', (message) => {
        expect(message.start).toBeDefined();
        expect(message.file).toBeDefined();
        expect(message.file).toEqual(file);
        expect(hasher.isReady()).toBe(false);
      });
      hasher.on('progress', (message) => {
        expect(message.progress).toBeDefined();
        expect(message.file).toBeDefined();
        expect(message.file).toEqual(file);
        expect(hasher.isReady()).toBe(false);
      });
      hasher.on('error', (error) => {
        console.error(error);
        expect(error).toBeDefined();
        expect(error.file).toBeDefined();
        expect(error.file).toEqual(file);
        expect(error instanceof Error).toBe(true);
        expect(false); // we don't expect an error message during tests
      });
      hasher.on('result', (message) => {
        expect(message.result).toBeDefined();
        expect(message.file).toBeDefined();
        expect(message.file).toEqual(file);
        expect(message.result).toEqual(expectation);
        expect(hasher.isReady()).toBe(false);
        setTimeout(() => {
          expect(hasher.isReady()).toBe(true);
          done();
        }, 100);
      });

      hasher.start(file);
    });
  }

  it('hasher with invalid parameter should throw invalid_parameter', function () {
    const hasher = new woleet.file.Hasher;
    //noinspection JSCheckFunctionSignatures
    const result = () => hasher.start(123);
    expect(result).toThrowError('invalid_parameter')
  });
});

function testErrorCode(expected) {
  return function (result) {
    expect(result).toBeDefined();
    expect(result.confirmations).toBeUndefined();
    expect(result.timestamp).toBeUndefined();
    expect(result.code).toBeDefined();
    expect(result.code).toBe(expected);
    return result;
  }
}

function noErrorExpected(error) {
  expect(error).toBeUndefined();
}

function noResultExpected(result) {
  expect(result).toBeUndefined();
}

function validationExpected(result) {
  expect(result).toBeDefined();
  expect(result.code).toBeDefined();
  expect(result.code).toBe('verified');
  expect(result.receipt).toBeDefined();
  expect(result.timestamp).toBeDefined();
  expect(result.confirmations).toBeDefined();
  expect(result.confirmations).toBeGreaterThan(0);
  expect(result.timestamp instanceof Date).toBe(true);
  return result;
}

describe("verify.WoleetDAB suite", function () {

  // Wait one second after each test not to exceed the API limit
  afterEach((done) => setInterval(done, 1000));

  it('verify.WoleetDAB with unknown file should return empty list', (done) => {
    woleet.verify.WoleetDAB(new PolyFile([new PolyBlob(['abcdef123456789'])], "image.png", { type: "image/png" }))
      .then((results) => {
        expect(results.length).toEqual(0);
      })
      .catch(noErrorExpected)
      .then(done)
  });

  it('verify.WoleetDAB with known file should not return empty list', (done) => {
    woleet.verify.WoleetDAB(new PolyFile([new PolyBlob([''])], "image.png", { type: "image/png" }))
      .then((results) => {
        expect(results.length).toBeGreaterThan(0);
        results.forEach((res) => validationExpected(res));
      })
      .catch(noErrorExpected)
      .then(done)
  });

  it('WoleetDAB with invalid parameter should throw "invalid_parameter" Error', (done) => {
    //noinspection JSCheckFunctionSignatures
    woleet.verify.WoleetDAB()
      .then((results) => noResultExpected(results))
      .catch((err) => {
        expect(err instanceof Error).toBe(true);
        expect(err.message).toBe("invalid_parameter");
      })
      .then(done)
  });
});

describe("verify.DAB suite", function () {
  const blob = new PolyBlob(['']);
  const file = nofail(() => new PolyFile([blob], "image.png", { type: "image/png" }));

  // Wait one second after each test not to exceed the API limit
  afterEach((done) => setInterval(done, 1000));

  it('verify.DAB with valid file and valid corresponding receipt should return valid result', (done) => {
    woleet.verify.DAB(file, emptyFileValidReceipt)
      .then(validationExpected)
      .catch(noErrorExpected)
      .then(done)
  });

  it('verify.DAB with valid file and valid corresponding signed receipt should return valid result', (done) => {
    woleet.verify.DAB(file, emptyFileValidSignedReceipt)
      .then(validationExpected)
      .catch(noErrorExpected)
      .then(done)
  });

  it('verify.DAB with valid file and valid corresponding Chainpoint 2 receipt should return valid result', (done) => {
    woleet.verify.DAB("bdf8c9bdf076d6aff0292a1c9448691d2ae283f2ce41b045355e2c8cb8e85ef2", validReceiptV22)
      .then(validationExpected)
      .catch(noErrorExpected)
      .then(done)
  });

  let invalidIdentityReceipt = safeCopy(emptyFileValidSignedReceipt);
  invalidIdentityReceipt.signature.identityURL = 'https://dve.woleet.io/v1/identity';
  it('verify.DAB with valid file and corresponding signed receipt with invalid identityURL should have identityVerificationStatus.code set to "http_error"', (done) => {
    woleet.verify.DAB(file, invalidIdentityReceipt)
      .then(validationExpected)
      .then((result) => {
        expect(result.identityVerificationStatus).toBeDefined();
        expect(result.identityVerificationStatus.code).toBeDefined();
        expect(result.identityVerificationStatus.code).toBe("http_error")
      })
      .catch(noErrorExpected)
      .then(done)
  });

  let invalidSignedReceipt = safeCopy(emptyFileValidSignedReceipt);
  invalidSignedReceipt.signature.signedHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b854";

  it('verify.DAB with valid file and corresponding signed receipt with invalid signedHash should return code target_hash_mismatch', (done) => {
    woleet.verify.DAB(file, invalidSignedReceipt)
      .then(testErrorCode('target_hash_mismatch'))
      .catch(noErrorExpected)
      .then(done)
  });

  let invalidSignedReceipt2 = safeCopy(emptyFileValidSignedReceipt);
  invalidSignedReceipt2.signature.pubKey = "19itkAbBMnjpC8xL4nHWWebgAMEGUS2coQ";

  it('verify.DAB with valid file and corresponding signed receipt with invalid pubKey should return code invalid_receipt_signature', (done) => {
    woleet.verify.DAB(file, invalidSignedReceipt2)
      .then(testErrorCode('invalid_receipt_signature'))
      .catch(noErrorExpected)
      .then(done)
  });

  let invalidSignedReceipt3 = safeCopy(emptyFileValidSignedReceipt);
  invalidSignedReceipt3.signature.signature = "HxVxyhfiJ1EyEDlhXidshWs3QQxb3JUcAvKpt1NLMonLXWWKXL39OLH3XXGofThp5JKjrZUY32sRoX6g2mh/Os0=";

  it('verify.DAB with valid file and corresponding signed receipt with invalid pubKey should return code invalid_receipt_signature', (done) => {
    woleet.verify.DAB(file, invalidSignedReceipt3)
      .then(testErrorCode('invalid_receipt_signature'))
      .catch(noErrorExpected)
      .then(done)
  });

  it('verify.DAB with valid file and valid NOT corresponding receipt should return code target_hash_mismatch', (done) => {
    woleet.verify.DAB(file, validReceipt)
      .then(testErrorCode('target_hash_mismatch'))
      .catch(noErrorExpected)
      .then(done)
  });

  it('verify.DAB with valid hash and valid corresponding receipt should return return valid result', (done) => {
    woleet.verify.DAB('0bf8e69866ff5db9efc108ea87953081ba627fb524a2c457dfb6c1b7df9430f9', validReceipt)
      .then(validationExpected)
      .catch(noErrorExpected)
      .then(done)
  });
});

describe("signature suite", function () {

  describe('signature validation', function () {

    const validateSignature = woleet.signature.validateSignature;

    function testSignature(expected) {
      return function (validation) {
        expect(validation).toBeDefined();
        expect(validation.valid).toBeDefined();
        expect(validation.valid).toBe(expected);
      };
    }

    const s = {
      "signature": "H4WyBAEqIj1Oc/sQDFLjwylJqZLHNv7bnvrgkzgkpzt6eryI4GHQrwvFfylZk1DDiI9796r6mZuTRdkWOyXFEA4=",
      "signedHash": "fd071b9817c9efccac5a144d69893a4a5323cbde4a74d5691c3cf3ab979d4160",
      "pubKey": "19itkAbBMnjpC8xL4nHWWebgANEGUS2coQ"
    };

    it('valid signature should be valid', (done) => {
      validateSignature(s.signedHash, s.pubKey, s.signature)
        .then(testSignature(true))
        .catch(noErrorExpected)
        .then(done)
    });

    it('invalid hash should not be valid', (done) => {
      validateSignature("fd071b9817c9efccbc5a144d69893a4a5323cbde4a74d5691c3cf3ab979d4160", s.pubKey, s.signature)
        .then(testSignature(false))
        .catch(noErrorExpected)
        .then(done)
    });

    it('invalid signature should not be valid', (done) => {
      validateSignature(s.signedHash, s.pubKey, "H4WyBAEqIj1Oc/sQDFLjvylJqZLHNv7bnvrgkzgkpzt6eryI4GHQrwvFfylZk1DDiI9796r6mZuTRdkWOyXFEA4=")
        .then(testSignature(false))
        .catch(noErrorExpected)
        .then(done)
    });

    it('invalid public key should not be valid', (done) => {
      validateSignature(s.signedHash, '19jtkAbBMnjpC8xL4nHWWebgANEGUS2coQ', s.signature)
        .then(testSignature(false))
        .catch(noErrorExpected)
        .then(done)
    });
  });

  describe('identity validation', function () {

    const validateIdentity = woleet.signature.validateIdentity;

    const s = {
      "signedHash": "fed6150564fe6bdba95c2ec0d7c650a7585d3fc755263d6a14499370fee3a08b",
      "pubKey": "miBDiJNw1moBD37mqjCVQNxGbEeqXtWnUG",
      "signature": "IONYJd+lXs9Fd4AK3IIJPrwU7SF4zRjsRnm4wi2vuFZVFxeKm73thDqvROQdcJIpxPcTODUkFUVthsFCw8xPrKg=",
      "identityURL": "https://api-dev.woleet.io/v1/identity"
    };

    it('validating valid identity should be true', (done) => {
      validateIdentity(s.identityURL, s.pubKey)
        .then((validation) => {
          expect(validation).toBeDefined();
          expect(validation.valid).toBe(true);
          expect(validation).toBeDefined();
          expect(validation.identity).toBeDefined();
          expect(validation.identity.commonName).toBe("Woleet Test Identity");
          expect(validation.identity.organization).toBe("Woleet SAS");
          expect(validation.identity.organizationalUnit).toBe("Production");
          expect(validation.identity.locality).toBe("Rennes");
          expect(validation.identity.country).toBe("FR");
        })
        .catch(noErrorExpected)
        .then(done)
    });

    it('validating valid identity in strict mode with a server that do not send back safe leftData should be false', (done) => {
      validateIdentity(s.identityURL, s.pubKey, true)
        .then((validation) => {
          expect(validation).toBeDefined();
          expect(validation.valid).toBe(false);
        })
        .catch(noErrorExpected)
        .then(done)
    });

    it('validating valid identity but bad url should throw an HTTP error', (done) => {
      validateIdentity("https://dve.woleet.io/v1/identity", s.pubKey)
        .then(noResultExpected)
        .catch((error) => {
          expect(error instanceof Error).toBe(true);
          expect(error.message).toBe('http_error');
        })
        .then(done)
    });

    it('validating valid identity but bad pubKey should throw an HTTP error', (done) => {
      validateIdentity(s.identityURL, 'mxpZfrKUekYRFRf95tqH1ttrhjHK5GtJ3X')
        .then(noResultExpected)
        .catch((error) => {
          expect(error instanceof Error).toBe(true);
          expect(error.message).toBe('http_error');
        })
        .then(done)
    });
  })
});
