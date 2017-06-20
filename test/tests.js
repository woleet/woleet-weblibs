/**
 * @namespace woleet
 */

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
        "target_proof": [{
            "parent": "628968521ab483a75de893f6a27132bae3ea55384c67f22ebb94199d07e0878e",
            "left": "764b64442f530395050237e09a646ee81b5798915e47818f5c5d1053773ca80b",
            "right": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        }]
    },
    "extra": [{"anchorid": "616980d1-7672-4558-b101-6c94bf7cee41"}]
};
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

    it('receipt.validate with bad proof element should throw merkle_root_mismatch', function () {
        const invalidReceipt = safeCopy(validReceipt);
        invalidReceipt.target.target_proof[0].left = "4715c9d59d8cc7f006c086997ac2c10b8081bc32e374262877299c8cd1f06dca";
        const result = () => woleet.receipt.validate(invalidReceipt);
        expect(result).toThrowError('merkle_root_mismatch');
    });
});

describe("transaction.get suite", function () {

    genTest('woleet.io');
    genTest('chain.so');
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
                        expect(tx.confirmedOn instanceof Date).toBe(true);
                        done();
                    }, (error) => {
                        expect(error).toBeUndefined();
                        done();
                    });
            });

            it('transaction.get with invalid tx id should return an error', (done) => {
                woleet.transaction.setDefaultProvider(provider);
                woleet.transaction.get('invalid_tx')
                    .then((tx) => {
                        expect(tx).toBeUndefined();
                        done();
                    }, (error) => {
                        expect(error instanceof Error).toBe(true);
                        expect(error.message).toBe('tx_not_found');
                        done();
                    });
            });

            it('transaction.get with unknown tx id should return an error', (done) => {
                woleet.transaction.setDefaultProvider(provider);
                woleet.transaction.get('invalid_tx')
                    .then((tx) => {
                        expect(tx).toBeUndefined();
                        done();
                    }, (error) => {
                        expect(error instanceof Error).toBe(true);
                        expect(error.message).toBe('tx_not_found');
                        done();
                    });
            });

            it('transaction.get without parameter should return an error', (done) => {
                woleet.transaction.setDefaultProvider(provider);
                woleet.transaction.get('0e50313029143187a44bf9fa9b9f08bf1b349291787ad8eeec2d09a2a5aaa1c4')
                    .then((tx) => {
                        expect(tx).toBeUndefined();
                        done();
                    }, (error) => {
                        expect(error instanceof Error).toBe(true);
                        expect(error.message).toBe('tx_not_found');
                        done();
                    });
            });
        });
    }

});

describe("receipt.get suite", function () {

    it('receipt.get with valid anchor id should return valid receipt', (done) => {
        woleet.receipt.get("c2f25d10-eae5-413c-82eb-1bdb6cf499b6")
            .then((receipt) => {
                expect(woleet.receipt.validate(receipt)).toBe(true);
                done();
            }, (error) => {
                expect(error).toBeUndefined();
                done();
            });
    });

    it('receipt.get with unknown anchor id should return "not_found"', (done) => {
        woleet.receipt.get('invalid_anchor_id')
            .then((tx) => {
                expect(tx).toBeUndefined();
                done();
            }, (error) => {
                expect(error instanceof Error).toBe(true);
                expect(error.message).toBe("not_found");
                done();
            });
    });

});

describe("anchor.getAnchorIDs suite", function () {

    it('anchor.getAnchorIDs with unknown/invalid file hash should return empty list', (done) => {
        woleet.anchor.getAnchorIDs('invalid_tx')
            .then((resultPage) => {
                expect(resultPage.length).toEqual(0);
                done();
            }, (error) => {
                expect(error).toBeUndefined();
                done();
            });
    });

    it('anchor.getAnchorIDs with invalid page size should return an error', (done) => {
        woleet.anchor.getAnchorIDs('invalid_tx', 1, -1)
            .then((resultPage) => {
                expect(resultPage).toBeUndefined();
                done();
            }, (error) => {
                expect(error instanceof Error).toBe(true);
                done();
            });
    });
});

describe("hasher suite", function () {
    const blob = new Blob(['abcdef123456789']);
    const file = new File([blob], "image.png", {type: "image/png"});

    testHasher('hasher with valid file should return valid hash', file, "a888e3c6de1f90d12f889952c0c7d0ac230e9014189914f65c548b8a3b44ef45");

    const midBlob = new Blob([(() => {
        let r = '', i = 1e6;
        while (i--) r += 'abcdef123456789';
        return r;
    })()]);
    const midFile = new File([midBlob], "image.png", {type: "image/png"});

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
                console.log(message.progress);
                expect(message.progress).toBeDefined();
                expect(message.file).toBeDefined();
                expect(message.file).toEqual(file);
                expect(hasher.isReady()).toBe(false);
            });
            hasher.on('error', (error) => {
                console.trace(error);
                expect(error).toBeDefined();
                expect(error instanceof Error).toBe(true);
                expect(error).toBeUndefined();
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

describe("verify.WoleetDAB suite", function () {

    // Wait one second after each test not to exceed the API limit
    afterEach((done) => setInterval(done, 1000));

    it('verify.WoleetDAB with unknown file should return empty list', (done) => {
        woleet.verify.WoleetDAB(new File([new Blob(['abcdef123456789'])], "image.png", {type: "image/png"}))
            .then((results) => {
                const len = results.length;
                expect(len).toEqual(0);
                done();
            }, (error) => {
                expect(error).toBeUndefined();
                done();
            })
    });

    it('verify.WoleetDAB with known file should not return empty list', (done) => {
        woleet.verify.WoleetDAB(new File([new Blob([''])], "image.png", {type: "image/png"}))
            .then((results) => {
                const len = results.length;
                expect(len).toBeGreaterThan(0);
                expect(results[0]).toBeDefined();
                expect(results[0].confirmations).toBeGreaterThan(0);
                expect(results[0].confirmedOn instanceof Date).toBe(true);
                done();
            }, (error) => {
                expect(error).toBeUndefined();
                done();
            })
    });

    it('WoleetDAB with invalid parameter should throw "invalid_parameter" Error', (done) => {
        //noinspection JSCheckFunctionSignatures
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
    const blob = new Blob(['']);
    const file = new File([blob], "image.png", {type: "image/png"});

    // Wait one second after each test not to exceed the API limit
    afterEach((done) => setInterval(done, 1000));

    it('verify.DAB with valid file and valid corresponding receipt should return valid result', (done) => {
        woleet.verify.DAB(file, emptyFileValidReceipt)
            .then((result) => {
                expect(result).toBeDefined();
                expect(result.confirmations).toBeGreaterThan(0);
                expect(result.confirmedOn instanceof Date).toBe(true);
                done();
            }, (error) => {
                expect(error).toBeUndefined();
                done();
            })
    });

    it('verify.DAB with valid file and valid corresponding signed receipt should return valid result', (done) => {
        woleet.verify.DAB(file, emptyFileValidSignedReceipt)
            .then((result) => {
                expect(result).toBeDefined();
                expect(result.confirmations).toBeGreaterThan(0);
                expect(result.confirmedOn instanceof Date).toBe(true);
                expect(result.signature).toBeDefined();
                expect(result.signature.valid).toBeDefined();
                expect(result.signature.valid).toBe(true);
                done();
            }, (error) => {
                expect(error).toBeUndefined();
                done();
            })
    });

    let invalidSignedReceipt = safeCopy(emptyFileValidSignedReceipt);
    invalidSignedReceipt.signature.signedHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b854";

    it('verify.DAB with valid file and corresponding signed receipt with invalid signedHash should throw target_hash_mismatch', (done) => {
        woleet.verify.DAB(file, invalidSignedReceipt)
            .then((result) => {
                expect(result).toBeUndefined();
                done();
            }, (error) => {
                expect(error instanceof Error).toBe(true);
                expect(error.message).toBe('target_hash_mismatch');
                done();
            })
    });

    let invalidSignedReceipt2 = safeCopy(emptyFileValidSignedReceipt);
    invalidSignedReceipt2.signature.pubKey = "19itkAbBMnjpC8xL4nHWWebgAMEGUS2coQ";

    it('verify.DAB with valid file and corresponding signed receipt with invalid pubKey should throw invalid_receipt_signature', (done) => {
        woleet.verify.DAB(file, invalidSignedReceipt2)
            .then((result) => {
                expect(result).toBeUndefined();
                done();
            }, (error) => {
                expect(error instanceof Error).toBe(true);
                expect(error.message).toBe('invalid_receipt_signature');
                done();
            })
    });

    let invalidSignedReceipt3 = safeCopy(emptyFileValidSignedReceipt);
    invalidSignedReceipt3.signature.signature = "HxVxyhfiJ1EyEDlhXidshWs3QQxb3JUcAvKpt1NLMonLXWWKXL39OLH3XXGofThp5JKjrZUY32sRoX6g2mh/Os0=";

    it('verify.DAB with valid file and corresponding signed receipt with invalid pubKey should throw invalid_receipt_signature', (done) => {
        woleet.verify.DAB(file, invalidSignedReceipt3)
            .then((result) => {
                expect(result).toBeUndefined();
                done();
            }, (error) => {
                expect(error instanceof Error).toBe(true);
                expect(error.message).toBe('invalid_receipt_signature');
                done();
            })
    });

    it('verify.DAB with valid file and valid NOT corresponding receipt should throw target_hash_mismatch', (done) => {
        woleet.verify.DAB(file, validReceipt)
            .then((result) => {
                expect(result).toBeUndefined();
                done();
            }, (error) => {
                expect(error instanceof Error).toBe(true);
                expect(error.message).toBe('target_hash_mismatch');
                done();
            })
    });

    it('verify.DAB with valid hash and valid corresponding receipt should return return valid result', (done) => {
        woleet.verify.DAB('0bf8e69866ff5db9efc108ea87953081ba627fb524a2c457dfb6c1b7df9430f9', validReceipt)
            .then((result) => {
                expect(result).toBeDefined();
                expect(result.confirmations).toBeDefined();
                expect(result.confirmedOn instanceof Date).toBe(true);
                done();
            }, (error) => {
                expect(error).toBeUndefined();
                done();
            })
    });
});

describe("signature suite", function () {

    describe('signature validation', function () {

        const validateSignature = woleet.signature.validateSignature;

        const s = {
            "signature": "H4WyBAEqIj1Oc/sQDFLjwylJqZLHNv7bnvrgkzgkpzt6eryI4GHQrwvFfylZk1DDiI9796r6mZuTRdkWOyXFEA4=",
            "signedHash": "fd071b9817c9efccac5a144d69893a4a5323cbde4a74d5691c3cf3ab979d4160",
            "pubKey": "19itkAbBMnjpC8xL4nHWWebgANEGUS2coQ"
        };

        it('valid signature should be valid', (done) => {
            validateSignature(s.signedHash, s.pubKey, s.signature)
                .then((validation) => {
                    expect(validation).toBeDefined();
                    expect(validation.valid).toBe(true);
                    done();
                }, (error) => {
                    expect(error).toBeUndefined();
                    done();
                })
        });

        it('invalid hash should not be valid', (done) => {
            validateSignature("fd071b9817c9efccbc5a144d69893a4a5323cbde4a74d5691c3cf3ab979d4160", s.pubKey, s.signature)
                .then((validation) => {
                    expect(validation).toBeDefined();
                    expect(validation.valid).toBe(false);
                    done();
                }, (error) => {
                    expect(error).toBeUndefined();
                    done();
                })
        });

        it('invalid signature should not be valid', (done) => {
            validateSignature(s.signedHash, s.pubKey, "H4WyBAEqIj1Oc/sQDFLjvylJqZLHNv7bnvrgkzgkpzt6eryI4GHQrwvFfylZk1DDiI9796r6mZuTRdkWOyXFEA4=")
                .then((validation) => {
                    expect(validation).toBeDefined();
                    expect(validation.valid).toBe(false);
                    done();
                }, (error) => {
                    expect(error).toBeUndefined();
                    done();
                })
        });

        it('invalid public key should not be valid', (done) => {
            validateSignature(s.signedHash, '19jtkAbBMnjpC8xL4nHWWebgANEGUS2coQ', s.signature)
                .then((validation) => {
                    expect(validation).toBeDefined();
                    expect(validation.valid).toBe(false);
                    done();
                }, (error) => {
                    expect(error).toBeUndefined();
                    done();
                })
        });

    });

    describe('identity validation', function () {

        const validateIdentity = woleet.signature.validateIdentity;

        const s = {
            "signedHash": "fed6150564fe6bdba95c2ec0d7c650a7585d3fc755263d6a14499370fee3a08b",
            "pubKey": "mxpZfrKUekYRFRf95tqH1ttrhjHK5GtJ3Y",
            "signature": "IErhb2L1w9G+tBaG7j1IZZ95jek6fkZFmmVMb0gS3r7mdh16aHJwxeLYucqdiZje8AWI8upZxWzWCxh0EYqqM+M=",
            "identityURL": "https://api-dev.woleet.io/v1/identity"
        };

        it('validating valid identity should be true', (done) => {
            validateIdentity(s.identityURL, s.pubKey)
                .then((validation) => {
                    expect(validation).toBeDefined();
                    expect(validation.valid).toBe(true);
                    done();
                }, (error) => {
                    expect(error).toBeUndefined();
                    done();
                })
        });

        it('validating valid identity but bad url should throw an error', (done) => {
            validateIdentity("https://dve.woleet.io/v1/identity", s.pubKey)
                .then((validation) => {
                    expect(validation).toBeUndefined();
                    done();
                }, (error) => {
                    expect(error instanceof Error).toBe(true);
                    done();
                })
        });

        it('validating valid identity but bad pubKey should throw error', (done) => {
            validateIdentity(s.identityURL, 'mxpZfrKUekYRFRf95tqH1ttrhjHK5GtJ3X')
                .then((validation) => {
                    expect(validation).toBeUndefined();
                    done();
                }, (error) => {
                    expect(error instanceof Error).toBe(true);
                    done();
                })
        });

    })

});
