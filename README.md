# Woleet web libraries

This repository contains the sources code of **Woleet web libraries**.
These libraries can be used in any web application to:
- verify the proof of existence and get the timestamp of any data anchored in the Bitcoin blockchain by Woleet or by any third party using [Chainpoint 1.0](http://www.chainpoint.org/#v1x) compatible anchoring receipts,
- verify the proof of signature, get the signature timestamp and verify the signee identity of any data anchored in the Bitcoin blockchain by Woleet (using signature anchoring, which is an extension of the Chainpoint 1.0 format) 
- compute the SHA256 hash of any file (even larger than 50MB).

Note that these libraries don't rely on the Woleet API (except **`woleet.verify.WoleetDAB`**,
**`woleet.receipt.get`** and **`woleet.anchor.getAnchorIds`** functions, which allow retrieving proof receipts from Woleet) and so don't require any Woleet account nor the
availability of the Woleet service to work: they only need to access Bitcoin transactions, which by default is done using
the Woleet API, but can be configured to use other independent providers like [blockcypher.com](https://blockcypher.com). 
 
# Building Woleet web libraries

Type `./build.sh` on the project's root to:
- install build tools and runtime dependencies into the `./node_modules/` directory
- build the libraries into the `./dist/`directory

# Using Woleet web libraries

## <a name="limitations"></a>Limitations

These libraries have been tested on all modern web browsers and should work on any browser supporting
[Promises](https://developer.mozilla.org/en-US/docs/Web/API/Promise)
and [Workers](https://developer.mozilla.org/en-US/docs/Web/API/Worker) (note that if Workers are not supported,
it is still possible to hash files whose size do not exceed 50MB).

Since Internet Explorer 11 does not fully support promises, you will have to 
include a third party library such as [bluebird](http://bluebirdjs.com/):

```html
<!-- IE ZONE -->
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
<script type="text/javascript">
  if (/MSIE \d|Trident.*rv:/.test(navigator.userAgent))
    document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.3.5/bluebird.min.js"><\/script>');
</script>
<!-- END IE ZONE -->
```

These libraries currently only support anchoring receipts compatible with the [Chainpoint 1.0](http://www.chainpoint.org/#v1x) standard.

## <a name="runtime-dependencies"></a>Runtime dependencies
 
Woleet web libraries uses the **[crypto-js](https://github.com/brix/crypto-js)** lib to compute SHA256 hashes of files.
 The minified version of this library (**crypto.min.js**) must be present in the directory containing Woleet web libraries,
 which is done by the default build process.

## Installation using npm

You can use npm to add Woleet web libraries to your project:

```npm i woleet-weblibs --save```

## Initialization

To use Woleet web libraries you have to include the following components:
```html
<script src="/node_modules/woleet-weblibs/dist/woleet-api.js"></script>
<script src="/node_modules/woleet-weblibs/dist/woleet-crypto.js"></script>
<script src="/node_modules/woleet-weblibs/dist/woleet-hashfile.js"></script>
<script src="/node_modules/woleet-weblibs/dist/woleet-signature.js"></script>
<script src="/node_modules/woleet-weblibs/dist/woleet-chainpoint.js"></script>
<script src="/node_modules/woleet-weblibs/dist/woleet-verify.js"></script>
```

or their minimized equivalent:

```html
<script src="/node_modules/woleet-weblibs/dist/woleet-weblibs.min.js"></script>
```

## Basic usage

All methods are provided by the `woleet` object. As an example, to get a Bitcoin transaction, the code is `woleet.transaction.get(txId)`.

### Verify a file (without its anchoring receipt)

**`woleet.verify.WoleetDAB(file)`** or **`woleet.verify.WoleetDAB(hash)`**

This function provides an easy way to verify a file that was anchored using the Woleet platform and flagged as **public** (which is the default):
 in that case, the anchoring receipt is retrieved automatically by the library from the platform, and so can be omitted.

See example at [examples/verifyWoleetDAB.html](examples/verifyWoleetDAB.html)

- Parameters:
    - `file`: a [File](#object_file) object.
    - `hash`: a SHA256 hash (as an hexadecimal characters String).
- Returns a Promise witch forwards:
  - on success: a list of [ReceiptVerificationStatus](#receipt_verification_status_object) object (can be empty).
    - the `code` attribute can be:
      - any error code thrown by [woleet.receipt.validate](#receiptValidate) (see below).
      - any error code thrown by the [Hasher](#hashfile) object (see below).
      - `invalid_receipt_signature`: the receipt's signature is not valid.
      - `invalid_receipt_signature_format`: the receipt's signature has not an expected format.
      - `identity_verification_failed`: the receipt's identityURL is not valid or returned a bad response.
      - `op_return_mismatches_merkle_root`: the Bitcoin transaction's OP_RETURN mismatches the receipt's Merkle root.
      - `tx_not_found`: the receipt's Bitcoin transaction cannot be found.
      - `error_while_getting_transaction`: the receipt's Bitcoin transaction cannot be found.
      - `file_matched_but_anchor_not_yet_processed`: the file has a match in our database but is waiting to be anchored.
      - `http_error` on a http request error.


### Verify a file (with its anchoring receipt) 

**`verify.DAB(file, receipt)`** or **`verify.DAB(hash, receipt)`**

This function allows to verify files anchored using the Woleet platform but flagged as **private**, or files anchored by third party platforms,
you must provide an anchoring receipt.

See example at [examples/verifyDAB.html](examples/verifyDAB.html)

- Parameters:
    - `file`: a [File](#object_file) object.
    - `hash`: a SHA256 hash (as an hexadecimal characters String).
    - `receipt`: a JSON parsed anchoring receipt.
- Returns a Promise witch forwards:
  - on success: a [ReceiptVerificationStatus](#receipt_verification_status_object) object.
    - the `code` attribute can be:
      - any error code thrown by [woleet.receipt.validate](#receiptValidate) (see below).
      - any error code thrown by the [Hasher](#hashfile) object (see below).    
      - `invalid_receipt_signature`: the receipt's signature is not valid.
      - `invalid_receipt_signature_format`: the receipt's signature has not an expected format.
      - `identity_verification_failed`: the receipt's identityURL is not valid or returned a bad response.
      - `op_return_mismatches_merkle_root`: the Bitcoin transaction's OP_RETURN mismatches the receipt's Merkle root.
      - `tx_not_found`: the receipt's Bitcoin transaction cannot be found.
      - `error_while_getting_transaction`: the receipt's Bitcoin transaction cannot be found.
      - `target_hash_mismatch`: the receipt's target hash is not equal to `hash` or to the `file` hash.
      - `http_error` on a http request error.

### <a name="hashfile"></a>Compute the SHA256 hash of a file

To compute the SHA256 hash of a file, you have to instance a Hasher object: `var hasher = new woleet.file.Hasher`.
This object provides an interface to hash files in the browser:

See example at [examples/hashfile.html](examples/hashfile.html)

**`hasher.on(event, callback)`**

This function allows to set the various callback functions used to monitor the hashing process and get the result.

- Parameters:
    - `event`: the event name
    - `callback`: a callback function to be called when the event is triggered

event name | callback prototype
----- | --------
`start` | `function ({ start: boolean `(always true)`, file: File })`
`progress` | `function ({ progress: Number `(between 0.0 and 1.0)`, file: File })`
`error` | `function ({ error: Error, file: File })`
`result` | `function ({ result: String `(SHA256 hash of the file)`, file: File })`

**`hasher.start(files)`** 

This functions allows to start the hashing process.

- Parameters:
    - `files`: a [FileList](#object_fileList) object.
- Throws:
    - `file_too_big_to_be_hashed_without_worker`: workers are not supported and the file exceeds the maximum size of the worker free hash function.
    - `invalid_parameter`: `files` parameter is not a File nor a FileList.
    - `not_ready`: the hasher is already hashing, you must wait for it to finish.

**`hasher.isReady()`**

This function check if the hasher is ready to be used.

- Returns `true` if the hasher is ready to be used (i.e. is not currently hashing).

**`hasher.cancel()`**

Cancels the current hash process (if several files are in the stack, the whole stack will be cancelled).

## Advanced usage

### <a name="receiptValidate"></a>Validate an anchoring receipt
 
**`woleet.receipt.validate(receipt)`**

This function allows to validate an anchoring receipt.

See example at [examples/validateReceipt.html](examples/receiptValidate.html)

- Parameters:
    - `receipt`: a JSON parsed anchoring receipt
- Returns:
    - `true` if the receipt is valid.
- Throws:
    - `invalid_receipt_format`: the receipt format is not supported.
    - `invalid_target_proof`: the receipt's Merkle proof is invalid (missing parent, left or right).
    - `invalid_parent_in_proof_element`: the receipt's Merkle proof is invalid (parent != SHA256(left + right)).
    - `non_sha256_target_proof_element`: the receipt's Merkle proof is invalid (parent, left or right not a SHA256 hash).
    - `merkle_root_mismatch`: the receipt's Merkle proof is invalid (Merkle proof result does not match the merkle_root attribute).

### Get Woleet public anchors matching a given file

**`woleet.anchor.getAnchorIDs(hash, type, size)`**

This function allows to retrieve from the Woleet platform all public anchors matching a given file.

- Parameters:
    - `hash`: the SHA256 hash of the file (as an hexadecimal characters String).
    - `type` (_optional_): type of anchor to retrieve among constants defined in woleet.anchor.types:
      - FILE_HASH
      - SIGNATURE
      - BOTH
    - `size` (_optional_): parameters setting the maximum number of anchor to retrieve (default: 20).
- Returns a promise witch forwards:
  - on success: containing the list (possibly empty) of the identifiers of all public anchors corresponding to the hash.
  - on error: 
    - `http_error` on a http request error.

### Get the anchoring receipt of a Woleet public anchor

**`woleet.receipt.get(anchorID)`**

- Parameters:
    - `anchorID`: the identifier of the anchor to retrieve.
- Returns a promise witch forwards:
  - on success: a [Receipt](#object_receipt) object.
  - on error: 
    - `not_found` if the anchor does not exist or is not public.
    - `http_error` on a http request error.

### Get a Bitcoin transaction

**`woleet.transaction.get(txid)`**

- Parameters:
    - `txid`: the identifier of the Bitcoin transaction to retrieve.
- Returns a promise witch forwards:
  - on succeed: a [Transaction](#object_transaction) object.
  - on error: 
    - `tx_not_found` if the transaction does not exits on the Bitcoin blockchain.
    - `http_error` on a http request error.

### Set the Bitcoin transaction provider

**`woleet.transaction.setDefaultProvider(provider)`**

- Parameter:
    - `provider: the provider to use as default provider: "woleet.io", "blockcypher.com" or "chain.so" (default is "woleet.io").

### Verify a signature and a signee identity

**`woleet.signature.validateSignature(message, pubKey, signature)`**

See example at [examples/signature.html](examples/signatureValidateSignature.html)

- Parameters:
    - `message`: the string that have been signed.
    - `pubKey`: a bitcoin address (in base 58).
    - `signature`: the signature (in base 64).
- Returns a Promise witch forwards an object: `{ valid: true }` if the signature is valid,
`{ valid: false, reason: string }` otherwise. Note that the **error** attribute may not be defined depending on the kind of failure.

**`woleet.signature.validateIdentity(identityUrl, pubKey)`**

- Parameters:
    - `identityUrl`: the provided identity URL.
    - `pubKey`: a bitcoin address (in base 58).
- Returns a Promise witch forwards:
  - on success: the same response than `signature.validateSignature`
  - on bad server response: 
    - A `bad_server_response` error if the server did not returned the expected data.
  - on network/server error: 
    - `http_error` on a http request error.


## Dependencies

Woleet web libraries are provided in several separate javascript files. For convenience, all these files are also wrapped
into a single *woleet-weblibs.js* file and minified versions are available.

  - *woleet-verify.js* provides file verification methods. It relies on:
    - *woleet-api.js*
    - *woleet-crypto.js*
    - *woleet-hashfile.js*
    - *woleet-signature.js*
    - *woleet-chainpoint.js*

  - *woleet-chainpoint.js* provides the receipt.validate method, it relies on
    - *woleet-crypto.js*

  - *woleet-hashfile.js* provides the file.Hasher class witch is an interface to hash files, it relies on:
    - *woleet-crypto.js*
    - *woleet-hashfile-worker.js*

  - *woleet-hashfile-worker.js* defines a worker used to hash files, it needs:
    - *crypto-js.js* library (only to be accessible, not to include)

  - *woleet-signature.js* provides the signature.validateIdentity and signature.validateSignature methods, as this file is essentially 
  a browserified version of [bitcoinjs-message](https://www.npmjs.com/package/bitcoinjs-message) it also exposes the Buffer class under signature.Buffer.
    
  - *woleet-api.js* provides miscellaneous method wrapping the Woleet API

#### Note:
In order to use a worker for hashing big files, you may have to indicates the worker's location before the libraries definitions:
```
<script>woleet = {workerScriptPath: '/my/path/woleet-hashfile-worker.js'}</script>
```
the *woleet-crypto.js* file must be in the same folder than *woleet-hashfile-worker.js*.

## Objects definitions

### <a name="object_transaction"></a>Transaction object
```
{
    txId: {String} identifier of the transaction
    confirmations: {Number} number of confirmations of the block containing the transaction
    timestamp: {Date} confirmation date of the block containing the transaction
    blockHash: {String} identifier of the block containing the transaction
    opReturn: {String} OP_RETURN of the transaction
}
```
#### Example
```json
{
    "blockHash": "00000000000000000276fb1e87fa581e09d943f198a8b9114167df0e2230c247",
    "confirmations": 3897,
    "timestamp": "Wed Nov 23 2016 16:21:54 GMT+0100 (CET)",
    "opReturn": "bf53f456227b377527349f337b8d11687e461a6ff01790deadb862bf1fa57fe9",
    "txId": "0e50313029143187a44bf9fa9b9f08bf1b349291787ad8eeec2d09a2a5aaa1c5"
}
```

### <a name="receipt_verification_status_object"></a>ReceiptVerificationStatus object
```
{
    confirmations: {Number} number of confirmations of the block containing the transaction
    timestamp: {Date} confirmation date of the block containing the transaction
    receipt: {Receipt} anchoring receipt
    code: {String} verifcations status code
    identityVerificationStatus: {
            code: 'verfied' | 'http_error' | 'identity_verification_failed' identity verifcations status code
        }
}
```
#### Example
```
{
    "timestamp": "Wed Nov 23 2016 16:21:54 GMT+0100 (CET)",
    "confirmations": 3897,
    "receipt": [Receipt object],
    "code": "verified"
}

### <a name="object_receipt"></a>Receipt object

The receipt object matches the [Chainpoint 1.0](http://www.chainpoint.org/#v1x) format.

#### Example
```json
{
    "header": {
        "chainpoint_version": "1.0",
        "merkle_root": "76280be77b005ee3a4e61a3301717289362e1a9106343c7afba21b55be33b39b",
        "tx_id": "01b321351b6a1dd315e08d5613c68c2cafc36e76239b9c3f3aced5e72194bded",
        "hash_type": "SHA-256",
        "timestamp": 1497625706
    },
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
    },
    "extra": [
        {
            "size": "0"
        },
        {
            "anchorid": "561920c1-68a0-468e-82c9-982e7c4b1c63"
        }
    ]
}
```

### <a name="object_fileList"></a>FileList object

See https://developer.mozilla.org/fr/docs/Web/API/FileList

### <a name="object_file"></a>File object

See https://developer.mozilla.org/fr/docs/Web/API/File