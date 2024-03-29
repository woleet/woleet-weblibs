# Woleet web libraries 

This repository contains the sources code of **Woleet web libraries**.
These libraries can be used in any web application to:
- **verify the proof of existence** (ie. retrieve the data timestamp) of any data anchored in the Bitcoin blockchain by Woleet or by any third party providing [Chainpoint]([chainpoint-link]) compatible proof receipts,
- **verify the proof of signature** (ie. retrieve the signature timestamp, verify the signature and optionally the identity of the signee) of any data signed and anchored in the Bitcoin blockchain by Woleet or by any third party providing proof receipts compatible with [signature anchoring](https://medium.com/@woleet/beyond-data-anchoring-bee867d9be3a), an extension of the Chainpoint format proposed by Woleet
- **compute the SHA256 hash** of any file (even larger than 500MB) efficiently (using native implementation whenever available). 

Note that these libraries do not rely on the Woleet API (except **`woleet.verify.WoleetDAB`**, **`woleet.anchor.getAnchorIds`** and **`woleet.receipt.get`** functions,
which allow to search and retrieve public proof receipts from Woleet) and therefore do not require any Woleet account nor the
availability of the Woleet service to operate: they only need to access Bitcoin transactions, which by default is done using
the Woleet's transaction explorer API, but can be configured to use other independent providers like [blockstream.info](https://blockstream.info) or [blockcypher.com](https://blockcypher.com). 

# Building Woleet web libraries

Type `./build.sh` on the project's root to: 
- install build tools and runtime dependencies into the `./node_modules/` directory 
- build the libraries into the `./dist/`directory 

# Using Woleet web libraries

## Installation

You can use npm to add Woleet web libraries to your project:

    npm i @woleet/woleet-weblibs --save

## Initialization

To use Woleet web libraries you have to include the following component:
```html
<script src="/node_modules/@woleet/woleet-weblibs/dist/woleet-weblibs.js"></script>
```

## <a name="runtime-dependencies"></a>Runtime dependencies

This library is delivered as a single `woleet-weblibs.js` script (a minified versions is also available).<br>

To be able to hash files larger than 500MB, the `woleet-hashfile-worker.min.js` and `woleet-crypto.min.js` scripts must be located in the same directory.

If the location of these 2 scripts is not the same as `woleet-weblibs.js`, or if `woleet-weblibs.js` is included in a bundle, you **must** indicate the path of the worker script before the libraries definitions:

```angular2html
<script>woleet = { workerScriptPath: '/my/path/to/woleet-hashfile-worker.min.js' }</script>
```

Example:

```sh
├── foo
│   ├── woleet-hashfile-worker.min.js # woleet-hashfile-worker
│   └── woleet-crypto.min.js # must NOT be renamed
├── bar
│   └── woleet-weblibs.min.js
└── index.html: 
      - <script>woleet = { workerScriptPath: "/foo/woleet-hashfile-worker.min.js" }</script>
      - <script src="/bar/woleet-weblibs.min.js"></script>
```

## <a name="limitations"></a>Limitations

### Proof format

These libraries currently only support proof of existence receipts compatible with the [Chainpoint]([chainpoint-link]) standard
and proof of signature receipts (an [extension of the Chainpoint standard](https://medium.com/@woleet/beyond-data-anchoring-bee867d9be3a) proposed by Woleet).

### Browsers

These libraries have been tested on all modern web browsers (so not on Internet Explorer) and should work on any browser supporting
[Promises](https://developer.mozilla.org/en-US/docs/Web/API/Promise)
and [Workers](https://developer.mozilla.org/en-US/docs/Web/API/Worker) (note that if Workers are not supported,
it is still possible to hash files whose size do not exceed 50MB).

## Basic usage

All methods are provided by the `woleet` object. As an example, to get a Bitcoin transaction, the code is `woleet.transaction.get(txId)`.

### Verify a file (without an proof receipt)

**`woleet.verify.WoleetDAB(file)`** or **`woleet.verify.WoleetDAB(hash)`**

Provides an easy way to retrieve and verify all public proof receipts related to a given file/hash created using the Woleet platform.

Proof of existence receipts (created when anchoring a data) and proof of signature receipts (created when anchoring the
 signature of a data) are retrieved from the Woleet platform and verified automatically.

See example at [examples/verifyWoleetDAB.html](examples/verifyWoleetDAB.html)

- Parameters:
    - `file`: the [File](#object_file) object containing the data to verify (with node: a [Buffer]([buffer-link]) or a [Readable]([readable-link]) object).
    - `hash`: the SHA256 hash of the data to verify (as an hexadecimal characters String).
- Returns a Promise witch forwards a list of [ReceiptVerificationStatus](#object_receipt_verification_status) object (can be empty).
The `code` attribute can be:
    - `verified` on success
    - any `code` value returned by [woleet.verify.receipt](#receiptVerify) (see below).
    - any error code thrown by the [Hasher](#hashfile) object (see below).
    - `target_hash_mismatch`: the receipt's target hash is not equal to the file hash or to the `hash` parameter.
    - `file_matched_but_anchor_not_yet_processed`: the file has a match in Woleet database but is waiting to be anchored.

### Verify a file (with a proof receipt) 

**`woleet.verify.DAB(file, receipt)`** or **`woleet.verify.DAB(hash, receipt)`**

Allows to verify any proof of existence receipt compatible with the Chainpoint 1 and 2 format,
or any proof of signature receipt compatible with the Chainpoint extension proposed by Woleet for signature
anchoring.

It first verifies the proof receipt, and then compare the provided hash (or the hash of the provided file)
to the anchored or signed hash referred in the receipt.

See example at [examples/verifyDAB.html](examples/verifyDAB.html)

- Parameters:
    - `file`: the [File](#object_file) object containing the data to verify (with node: a [Buffer]([buffer-link]) or a [Readable]([readable-link]) object).
    - `hash`: the SHA256 hash of the data to verify (as an hexadecimal characters String).
    - `receipt`: a JSON parsed proof of existence or proof of signature receipt.
- Returns a Promise which forwards a [ReceiptVerificationStatus](#object_receipt_verification_status) object.
The `code` attribute can be:
    - `verified` on success
    - any `code` value returned by [woleet.verify.receipt](#receiptVerify) (see below).
    - any error code thrown by the [Hasher](#hashfile) object (see below).
    - `target_hash_mismatch`: the receipt's target hash is not equal to the file hash or to the `hash` parameter.

### <a name="receiptVerify"></a>Verify a proof receipt

**`woleet.verify.receipt(receipt)`**

Allows to verify any proof of existence receipt compatible with the Chainpoint format,
or any proof of signature receipt compatible with the Chainpoint extension proposed by Woleet for signature
anchoring.

It first verifies the embedded cryptographic proof, then access the Bitcoin transaction to check the timestamp of
the proof, then verifies the signature (if any) and the signee identity (if any).

See example at [examples/receiptVerify.html](examples/verifyReceipt.html)

- Parameters:
    - `receipt`: a JSON parsed anchoring receipt.
- Returns a Promise which forwards a [ReceiptVerificationStatus](#object_receipt_verification_status) object.
The `code` attribute can be:
    - `verified` on success
    - any error code thrown by [woleet.receipt.validate](#receiptValidate) (see below)
    - any error code thrown by the [Hasher](#hashfile) object (see below).
    - `invalid_receipt_signature`: the receipt's signature is not valid.
    - `invalid_receipt_signature_format`: the receipt's signature is not of the expected format.
    - `op_return_mismatches_merkle_root`: the Bitcoin transaction's OP_RETURN mismatches the receipt's Merkle root.
    - `tx_not_found`: the transaction does not exist in the Bitcoin blockchain.
    - `tx_not_confirmed`: the transaction is not yet confirmed by the Bitcoin blockchain (ie. not yet included in a block).
    - `http_error`: an unexpected HTTP error occurred during the verification process.

### <a name="hashfile"></a>Compute the SHA256 hash of a file

To compute the SHA256 hash of a file, you have to instantiate a Hasher object:
 
**`let hasher = new woleet.file.Hasher()`.**

or

**`let hasher = new woleet.file.Hasher({path to the worker script})`.**

This object provides an interface to hash files in the browser:

See example at [examples/hashfile.html](examples/hashfile.html)

**`hasher.on(event, callback)`**

Allows to set the various callback functions used to monitor the hashing process and get the result.

- Parameters:
    - `event`: the name of the event to catch
    - `callback`: a callback function to be called when the event is triggered

event name | callback prototype
----- | --------
`start` | `function ({ start: boolean `(always true)`, file: File })`
`progress` | `function ({ progress: Number `(between 0.0 and 1.0)`, file: File })`
`error` | `function ({ error: Error, file: File })`
`result` | `function ({ result: String `(SHA256 hash of the file)`, file: File })`
`cancel` | `function ({ file: File })`
`skip` | `function ({ file: File })`

**`hasher.start(files)`** 

Allows to start the hashing process.

- Parameters:
    - `files` can be:
        - a [FileList](#object_fileList) object.
        - a single [File](#object_file) object.
        - a [File](#object_file) object array.
        - with node: a [Buffer]([buffer-link]) or a [Readable]([readable-link]) object.
        - with node: a [Buffer]([buffer-link]) or a [Readable]([readable-link]) object array.
- Throws:
    - `file_too_big_to_be_hashed_without_worker`: workers are not supported and the file exceeds the maximum size of the worker free hash function.
    - `invalid_parameter`: `files` parameter is not a File nor a FileList.
    - `not_ready`: the hasher is already performing a hash, you must wait for it to finish.

**`hasher.isReady()`**

Checks if the hasher is ready to be used.

- Returns `true` if the hasher is ready to be used (i.e. is not currently hashing).

**`hasher.skip()`**

Skips the current hash process (if several files are in the stack, the files beyond the skipped files will be hashed).

Notes: 
 - the file list passed in `hasher.start(files)` will not be modified, so a skipped file will still be in it
 but will never emit a `result event.`
 - **not available** in node if files is a [Buffer]([buffer-link]) or a [Buffer]([buffer-link]) array.

**`hasher.cancel()`**

Cancels the whole hash process stack (if several files are in the stack, the whole stack will be cancelled).

Note: this method is **not available** in node if files is a [Buffer]([buffer-link]) or a [Buffer]([buffer-link]) array.

## Advanced usage

### <a name="receiptValidate"></a>Validate the format of a proof receipt

**`woleet.receipt.validate(receipt)`**

Allows to validate the format of a proof receipt.

Does not check the Bitcoin transaction, nor the signature, nor the signee identity (if any).

- Parameters:
    - `receipt`: a JSON parsed proof receipt.
- Returns:
    - `true` if the receipt is valid.
- Throws errors:
    - `invalid_receipt_format`: the receipt format is not supported.
    - `invalid_target_proof`: the receipt's Merkle proof is invalid (missing parent, left or right).
    - `invalid_parent_in_proof_element`: the receipt's Merkle proof is invalid (parent != SHA256(left + right)).
    - `non_sha256_target_proof_element`: the receipt's Merkle proof is invalid (parent, left or right not a SHA256 hash).
    - `merkle_root_mismatch`: the receipt's Merkle proof is invalid (Merkle proof result does not match the merkle_root attribute).

### <a name="signatureValidateSignature"></a>Validate a signature

**`woleet.signature.validateSignature(message, pubKey, signature)`**

Allows to validate a signature.

Checks that the signature is valid for the message and produced by the public key.

See example at [examples/signature.html](examples/validateSignature.html)

- Parameters:
    - `message`: the string that have been signed.
    - `pubKey`: a bitcoin address (in base 58).
    - `signature`: the signature (in base 64).
- Returns a Promise which forwards an object:
    - `valid`: a boolean that indicates if signature is valid or not.
    - `reason`: a string that gives details about the validation failure (if any).
<br>Note that the **reason** attribute may not be defined depending on the kind of failure.

### <a name="signatureValidateIdentity"></a>Validate a signee identity
 
**`woleet.signature.validateIdentity(identityUrl, pubKey, signedIdentity, signedIssuerDomain)`**

Allows to validate the identity of a signee using an identity server.

Checks that the public key is known by the identity server, associated to an identity and/or controlled by the identity server
(by asking it to sign some random data and checking the returned signature).
Can also check that the identity claimed by the server, if any, matches the identity signed by the signee 
and that the identity URL of the identity server matches the issuer domain signed by the signee.

See example at [examples/signature.html](examples/validateIdentity.html)

- Parameters:
    - `identityUrl`: the identity URL of the identity server.
    - `pubKey`: the bitcoin address (in base 58) of the signee
    - `signedIdentity`: optional: the X500 Distinguished Name of the signee (must match the identity returned by the server).
    - `signedIssuerDomain`: optional: the domain of the identity server (must include the domain of the identity URL).
- Returns a Promise which forwards an object:
    - `valid`: a boolean that indicates if identity is valid or not.
    - `reason`: a string that gives details about the validation failure (if any).
    - `identity` an [Identity](#object_identity) object (as returned by the identity server).
    - `signedIdentity` an [Identity](#object_identity) object (deserialized version of the X500 Distinguished Name).
<br>Note that the **reason** attribute may not be defined depending on the kind of failure.

### Get Woleet public anchors matching some data

**`woleet.anchor.getAnchorIDs(hash, type, size)`**

Allows to retrieve from the Woleet platform all public anchors matching some data.

- Parameters:
    - `hash`: the SHA256 hash of the data (as an hexadecimal characters String).
    - `type` (_optional_): type of anchors to retrieve  (default: BOTH):
      - DATA: only data anchors will be retrieved
      - SIGNATURE: only signature anchors will be retrieved
      - BOTH: both data and signature anchors will be retrieved
    - `size` (_optional_): parameters setting the maximum number of anchor per type to retrieve (default: unlimited).
- Returns a promise which forwards:
  - on success: containing the list (possibly empty) of the identifiers of all public anchors corresponding to the hash.
  - on error: 
    - An `http_error` Error: an unexpected HTTP error occurred during the verification process.

### Get the proof receipt of a public anchor created by Woleet

**`woleet.receipt.get(anchorID)`**

- Parameters:
    - `anchorID`: the identifier of the anchor for which to retrieve the proof receipt.
- Returns a promise which forwards:
  - on success: a [Receipt](#object_receipt) object.
  - on error: 
    - A `not_found` Error: the anchor does not exist or is not public.
    - An `http_error` Error: an unexpected HTTP error occurred during the verification process.

### Get a Bitcoin transaction

**`woleet.transaction.get(txid)`**

- Parameters:
    - `txid`: the identifier of the Bitcoin transaction to retrieve.
- Returns a promise which forwards:
  - on succeed: a [Transaction](#object_transaction) object.
  - on error: 
    - A `tx_not_found` Error: the transaction does not exits on the Bitcoin blockchain.
    - An `http_error` Error: an unexpected HTTP error occurred during the verification process.

### Set the Bitcoin transaction provider

**`woleet.config.setDefaultTransactionProvider(tansactionProvider)`**

- Parameter:
    - `tansactionProvider`: the default bitcoin transaction provider to use: "woleet.io", "blockcypher.com" or "blocksteam.info" (default is "woleet.io").
    
### Set the Woleet API

**`woleet.config.setDefaultWoleetApiUrl(woleetApiUrl)`**

- Parameter:
    - `woleetApiUrl`: the default URL of the Woleet API to use (default is "https://api.woleet.io/v1").

## Objects definitions

### <a name="object_receipt_verification_status"></a>ReceiptVerificationStatus object
```
{
    code: {'verified' | error message } receipt verifcation status code
    timestamp: {Date} proven timestamp of the data (for a data anchor) or of the signature (for a signature anchor)
    confirmations: {Number} number of confirmations of the block containing the transaction
    receipt: {Receipt} proof receipt
    identityVerificationStatus: 
    {
        code: {'verified' | 'identity_mismatch' | 'invalid_signature' | http_error'} identity verifcation status code 
        identity: [Identity object]
    }
}
```
#### Example
```
{
    "code": "verified",
    "timestamp": "Wed Nov 23 2016 16:21:54 GMT+0100 (CET)",
    "confirmations": 3897,
    "receipt": [Receipt object]
    "identityVerificationStatus": {
        "code": "verified",
        "identity": {
            "commonName": "John Smith",
            "emailAddress": "john.smith@woleet.com",
            "organizationalUnit": "Production",
            "organization": "Woleet SAS",
            "locality": "Rennes",
            "country": "FR"
        }
    }
}
```

### <a name="object_identity"></a>Identity object

Signee's identity provided as a set of X.500 attributes (see https://www.ietf.org/rfc/rfc4519.txt).

| Attribute          | Description                            |
|--------------------|----------------------------------------|
| commonName         | commonName (CN) (2.5.4.3)              |
| emailAddress       | emailAddress (EMAILADDRESS)            |
| organization       | organizationName (O) (2.5.4.10)        |
| organizationalUnit | organizationalUnitName (OU) (2.5.4.11) |
| locality           | localityName (L) (2.5.4.7)             |
| country            | countryName (C) (2.5.4.6)              |

Example : 
```json
{
  "commonName": "John Smith",
  "emailAddress": "john.smith@woleet.com",
  "organizationalUnit": "Production",
  "organization": "Woleet SAS",
  "locality": "Rennes",
  "country": "FR"
}
```

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

### <a name="object_receipt"></a>Receipt object

The receipt object matches the [Chainpoint]([chainpoint-link]) format.

#### Chainpoint 1 Example
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
    }
}
```

#### Chainpoint 2 Example
```json
{
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
}
```

### <a name="object_fileList"></a>FileList object

See https://developer.mozilla.org/fr/docs/Web/API/FileList

### <a name="object_file"></a>File object

See https://developer.mozilla.org/fr/docs/Web/API/File

[buffer-link]: https://nodejs.org/api/buffer.html
[readable-link]: https://nodejs.org/api/stream.html#stream_readable_streams
[chainpoint-link]: http://www.chainpoint.org/
[bitcoinjs-message-link]: https://www.npmjs.com/package/bitcoinjs-message
