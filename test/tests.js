var validReceipt = {
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
var emptyfileValidReceipt = {
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
        "target_proof": [{
            "parent": "628968521ab483a75de893f6a27132bae3ea55384c67f22ebb94199d07e0878e",
            "left": "764b64442f530395050237e09a646ee81b5798915e47818f5c5d1053773ca80b",
            "right": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }]
    },
    "extra": [{"anchorid": "616980d1-7672-4558-b101-6c94bf7cee41"}]
};

jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

Object.freeze(validReceipt);

function safeCopy(obj) {
    return JSON.parse(JSON.stringify(obj))
}

// Force the blockchain provider (default is woleet.io)
//woleet.transaction.setDefaultProvider('woleet.io');
//woleet.transaction.setDefaultProvider('chain.so');
//woleet.transaction.setDefaultProvider('blockcypher.com');

describe("isSHA256 suite", function () {
    it('isSHA256("789") should be false', function () {
        var result = woleet.isSHA256('789');
        expect(result).toBe(false);
    });

    it('isSHA256(789) should be false', function () {
        //noinspection JSCheckFunctionSignatures
        var result = woleet.isSHA256(789);
        expect(result).toBe(false);
    });

    it('isSHA256("abcdef123456789") should be false', function () {
        var result = woleet.isSHA256("abcdef123456789");
        expect(result).toBe(false);
    });

    it('isSHA256 with good length but wrong character should be false', function () {
        var result = woleet.isSHA256("4b4a6eff59b5d297b7f68ffa0603268e0550dd03845cf0b89ad5cd53cb564a2q");
        expect(result).toBe(false);
    });

    it('isSHA256 with valid SHA256 hash should be true', function () {
        var result = woleet.isSHA256("4b4a6eff59b5d297b7f68ffa0603268e0550dd03845cf0b89ad5cd53cb564a23");
        expect(result).toBe(true);
    });
});

describe("receipt.validate suite", function () {

    it('valid receipt should be valid', function () {
        var result = woleet.receipt.validate(validReceipt);
        expect(result).toBe(true);
    });

    it('receipt.validate without param should throw invalid_receipt_format', function () {
        //noinspection JSCheckFunctionSignatures
        var result = () => woleet.receipt.validate();
        expect(result).toThrowError('invalid_receipt_format');
    });

    it('receipt.validate("789") should throw invalid_receipt_format', function () {
        var result = () => woleet.receipt.validate('789');
        expect(result).toThrowError('invalid_receipt_format');
    });

    it('receipt.validate with missing target should throw invalid_receipt_format', function () {
        var invalidReceipt = safeCopy(validReceipt);
        delete invalidReceipt['target'];
        var result = () => woleet.receipt.validate(invalidReceipt);
        expect(result).toThrowError('invalid_receipt_format');
    });

    it('receipt.validate without param should throw invalid_receipt_format', function () {
        //noinspection JSCheckFunctionSignatures
        var result = () => woleet.receipt.validate();
        expect(result).toThrowError('invalid_receipt_format');
    });

    it('receipt.validate with missing proof element should throw invalid_target_proof', function () {
        var invalidReceipt = safeCopy(validReceipt);
        delete invalidReceipt.target.target_proof[0].left;
        var result = () => woleet.receipt.validate(invalidReceipt);
        expect(result).toThrowError('invalid_target_proof');
    });

    it('receipt.validate with non-sha256 proof element should throw non_sha256_target_proof_element', function () {
        var invalidReceipt = safeCopy(validReceipt);
        invalidReceipt.target.target_proof[0].left = "asx";
        var result = () => woleet.receipt.validate(invalidReceipt);
        expect(result).toThrowError('non_sha256_target_proof_element');
    });

    it('receipt.validate with bad proof element should throw merkle_root_mismatch', function () {
        var invalidReceipt = safeCopy(validReceipt);
        invalidReceipt.target.target_proof[0].left = "4715c9d59d8cc7f006c086997ac2c10b8081bc32e374262877299c8cd1f06dca";
        var result = () => woleet.receipt.validate(invalidReceipt);
        expect(result).toThrowError('merkle_root_mismatch');
    });
});

describe("transaction.get suite", function () {

    // Wait one second after each test not to exceed the API limit
    afterEach((done) => setInterval(done, 1000));

    it('transaction.get with valid tx id should return transaction object', function (done) {
        woleet.transaction.get(validReceipt.header.tx_id)
            .then(function (tx) {
                expect(tx.blockHash).toEqual("00000000000000000276fb1e87fa581e09d943f198a8b9114167df0e2230c247");
                expect(tx.opReturn).toEqual(validReceipt.header.merkle_root);
                expect(tx.confirmations).toBeGreaterThan(4500);
                expect(tx.confirmedOn instanceof Date).toBe(true);
                done();
            }, function (error) {
                expect(error).toBeUndefined();
                done();
            });
    });

    it('transaction.get with invalid tx id should return an error', function (done) {
        woleet.transaction.get('invalid_tx')
            .then(function (tx) {
                expect(tx).toBeUndefined();
                done();
            }, function (error) {
                expect(error instanceof Error).toBe(true);
                done();
            });
    });

    it('transaction.get without parameter should return an error', function (done) {
        woleet.transaction.get('invalid_tx')
            .then(function (tx) {
                expect(tx).toBeUndefined();
                done();
            }, function (error) {
                expect(error instanceof Error).toBe(true);
                done();
            });
    });
});

describe("receipt.get suite", function () {

    it('receipt.get with valid anchor id should return valid receipt', function (done) {
        woleet.receipt.get("c2f25d10-eae5-413c-82eb-1bdb6cf499b6")
            .then(function (receipt) {
                expect(woleet.receipt.validate(receipt)).toBe(true);
                done();
            }, function (error) {
                expect(error).toBeUndefined();
                done();
            });
    });

    it('receipt.get with unknown anchor id should return "not_found"', function (done) {
        woleet.receipt.get('invalid_anchor_id')
            .then(function (tx) {
                expect(error).toBeUndefined();
                done();
            }, function (error) {
                expect(error instanceof Error).toBe(true);
                expect(error.message).toBe("not_found");
                done();
            });
    });

});

describe("anchor.getAnchorIDs suite", function () {

    it('anchor.getAnchorIDs with unknown/invalid file hash should return empty list', function (done) {
        woleet.anchor.getAnchorIDs('invalid_tx')
            .then(function (resultPage) {
                expect(resultPage.content.length).toEqual(0);
                done();
            }, function (error) {
                expect(error).toBeUndefined();
                done();
            });
    });

    it('anchor.getAnchorIDs with invalid page size should return an error', function (done) {
        woleet.anchor.getAnchorIDs('invalid_tx', -1)
            .then(function (resultPage) {
                expect(resultPage).toBeUndefined();
                done();
            }, function (error) {
                expect(error instanceof Error).toBe(true);
                done();
            });
    });
});

describe("hasher suite", function () {
    var blob = new Blob(['abcdef123456789']);
    var file = new File([blob], "image.png", {type: "image/png"});

    it('hasher with valid file should return valid hash', function (done) {

        var hasher = new woleet.file.Hasher;
        expect(hasher.isReady()).toBe(true);

        hasher.on('start', function (message) {
            expect(message.start).toBeDefined();
            expect(message.file).toBeDefined();
            expect(message.file).toEqual(file);
            expect(hasher.isReady()).toBe(false);
        });
        hasher.on('progress', function (message) {
            expect(message.progress).toBeDefined();
            expect(message.file).toBeDefined();
            expect(message.file).toEqual(file);
            expect(hasher.isReady()).toBe(false);
        });
        hasher.on('error', function (error) {
            expect(error).toBeDefined();
            expect(error instanceof Error).toBe(true);
        });
        hasher.on('result', function (message) {
            expect(message.result).toBeDefined();
            expect(message.file).toBeDefined();
            expect(message.file).toEqual(file);
            expect(message.result).toEqual("a888e3c6de1f90d12f889952c0c7d0ac230e9014189914f65c548b8a3b44ef45");
            expect(hasher.isReady()).toBe(false);
            setTimeout(() => {
                expect(hasher.isReady()).toBe(true);
                done();
            }, 100);
        });

        hasher.start(file);
    });

    it('hasher with invalid parameter should throw invalid_parameter', function () {
        var hasher = new woleet.file.Hasher;
        //noinspection JSCheckFunctionSignatures
        var result = () => hasher.start(123);
        expect(result).toThrowError('invalid_parameter')
    });
});

describe("verify.WoleetDAB suite", function () {

    // Wait one second after each test not to exceed the API limit
    afterEach((done) => setInterval(done, 1000));

    it('verify.WoleetDAB with unknown file should return empty list', function (done) {
        woleet.verify.WoleetDAB(new File([new Blob(['abcdef123456789'])], "image.png", {type: "image/png"}))
            .then(function (results) {
                var len = results.length;
                expect(len).toEqual(0);
                done();
            }, function (error) {
                expect(error).toBeUndefined();
                done();
            })
    });

    it('verify.WoleetDAB with known file should not return empty list', function (done) {
        woleet.verify.WoleetDAB(new File([new Blob([''])], "image.png", {type: "image/png"}))
            .then(function (results) {
                var len = results.length;
                expect(len).toBeGreaterThan(0);
                done();
            }, function (error) {
                expect(error).toBeUndefined();
                done();
            })
    });

    it('WoleetDAB with invalid parameter should throw "invalid_parameter" Error', function (done) {
        woleet.verify.WoleetDAB().then((results) => {
            expect(results).toBeUndefined();
            done();
        }, (err) => {
            expect(err instanceof Error).toBe(true);
            expect(err.message).toBe("invalid_parameter");
            done();
        });
    });
});

describe("verify.DAB suite", function () {
    var blob = new Blob(['']);
    var file = new File([blob], "image.png", {type: "image/png"});

    // Wait one second after each test not to exceed the API limit
    afterEach((done) => setInterval(done, 1000));

    it('verify.DAB with valid file and valid corresponding receipt should return valid result', function (done) {
        woleet.verify.DAB(file, emptyfileValidReceipt)
            .then(function (result) {
                expect(result).toBeDefined();
                expect(result.confirmations).toBeDefined();
                expect(result.confirmedOn instanceof Date).toBe(true);
                done();
            }, function (error) {
                expect(error).toBeUndefined();
                done();
            })
    });

    it('verify.DAB with valid file and valid NOT corresponding receipt should through target_hash_mismatch', function (done) {
        woleet.verify.DAB(file, validReceipt)
            .then(function (result) {
                expect(result).toBeUndefined();
                done();
            }, function (error) {
                expect(error instanceof Error).toBe(true);
                expect(error.message).toBe('target_hash_mismatch');
                done();
            })
    });

    it('verify.DAB with valid hash and valid corresponding receipt should return return valid result', function (done) {
        woleet.verify.DAB('0bf8e69866ff5db9efc108ea87953081ba627fb524a2c457dfb6c1b7df9430f9', validReceipt)
            .then(function (result) {
                expect(result).toBeDefined();
                expect(result.confirmations).toBeDefined();
                expect(result.confirmedOn instanceof Date).toBe(true);
                done();
            }, function (error) {
                expect(error).toBeUndefined();
                done();
            })
    });
});
