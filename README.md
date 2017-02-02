# Woleet web libraries

This repository contains the sources code of **Woleet web libraries**.
These libraries can be used in any web application to:
- verify the integrity and timestamp of any data anchored on the Bitcoin blockchain (so called DAB) by Woleet or by any third party using [Chainpoint 1.0](http://www.chainpoint.org/#v1x) compatible anchoring receipts,
- compute the SHA256 hash of any file (even larger than 50MB).

Note that these libraries don't rely on the Woleet API (except **`woleet.verify.WoleetDAB`**,
**`woleet.receipt.get`** and **`woleet.anchor.getAnchorIds`** functions) and so don't require any Woleet account nor the
availability of the Woleet service to work: they only need to access Bitcoin transactions, which by default is done using
the Woleet API, but can be configured to use other independent providers like [blockcypher.com](https://blockcypher.com). 
 
# Building Woleet web libraries

Type `./build.sh` on the project's root to:
- install build tools into the `./node_modules/` directory
- install runtime dependencies into the `./bower_components/` directory
- build the libraries into the `./dist/`directory

# Using Woleet web libraries

## Limitations

These libraries have been tested on all modern web browsers and should work on any browser supporting
[Promises](https://developer.mozilla.org/en-US/docs/Web/API/Promise)
and [Workers](https://developer.mozilla.org/en-US/docs/Web/API/Worker) (note that if Workers are not supported,
it is still possible to hash files whose size do not exceed 50MB).

Since Internet Explorer 11 does not support promises, you will have to 
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

## Runtime dependencies
 
Woleet web libraries uses the **[crypto-js](https://github.com/brix/crypto-js)** lib to compute SHA256 hashes of files.
 The minified version of this library (**crypto.min.js**) must be present in the directory containing Woleet web libraries,
 which is done by the default build process.

## Installation using Bower

You can use Bower to add Woleet web libraries to your project:

```json
  "dependencies": {
    "woleet-weblibs": "*"
  }
```

***In this documentation, it is supposed that Bower is used to install Woleet web libraries.***

## Initialization

To use Woleet web libraries you have to include the following components:
```html
<script src="../bower_components/woleet-weblibs/dist/woleet-api.js"></script>
<script src="../bower_components/woleet-weblibs/dist/woleet-hashfile.js"></script>
<script src="../bower_components/woleet-weblibs/dist/woleet-chainpoint.js"></script>
<script src="../bower_components/woleet-weblibs/dist/woleet-verify.js"></script>
```

or their minimized equivalent:

```html
<script src="../bower_components/woleet-weblibs/dist/woleet-weblibs.min.js"></script>
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
  - on success: a list of Proof* object (can be empty).
  - on error: 
    - any error thrown by [woleet.receipt.validate](#receiptValidate) (see below).
    - any error thrown by the [Hasher](#hashfile) object (see below).
    - `file_matched_but_anchor_not_yet_processed`: the file has a match in our database but is waiting for anchoring.
    - `missing_woleet_hash_dependency`: woleet-hashfile.js was not found.

### Verify a file (with its anchoring receipt) 

**`verify.DAB(file, receipt)`** or **`verify.DAB(hash, receipt)`**

This function allows to verify files anchored using the Woleet platform but flagged as **private**, or files anchored by third party platforms,
you must provide a anchoring receipt.

See example at [examples/verifyDAB.html](examples/verifyDAB.html)

- Parameters:
    - `file`: a [File](#object_file) object.
    - `hash`: a SHA256 hash (as an hexadecimal characters String).
    - `receipt`: a JSON parsed anchoring receipt.
- Returns a Promise witch forwards:
  - on success: a [Proof](#object_proof) object.
  - on error: 
    - any error thrown by [woleet.receipt.validate](#receiptValidate) (see below).
    - any error thrown by the [Hasher](#hashfile) object (see below).
    - `missing_woleet_hash_dependency`: woleet-hashfile.js was not found.
    - `target_hash_mismatch`: the receipt's target hash is not equal to `hash` or to the `file` hash.
    - `transaction_not_found`: the receipt's Bitcoin transaction cannot be found.
    - `opReturn_mismatches_merkleRoot`: the Bitcoin transaction's OP_RETURN mismatches the receipt's Merkle root.

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
    - `no_viable_hash_method`: workers are not supported ***and*** crypto-js lib is not included on the page.

**`hasher.isReady()`**

This function check if the hasher is ready to be used.

- Returns `true` if the hasher is ready to be used (i.e. is not currently hashing).

## Advanced usage

### <a name="receiptValidate"></a>Validate a anchoring receipt
 
**`woleet.receipt.validate(receipt)`*

This function allows to validate an anchoring receipt.

See example at [examples/validateReceipt.html](examples/validateReceipt.html)

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

**`woleet.anchor.getAnchorIDs(hash[, size])`**

This function allows to retreive from the Wollet platform all public anchors matching a given file.

- Parameters:
    - `hash`: the SHA256 hash of the file (as an hexadecimal characters String).
    - `size`: optional parameters setting the size of pages to retrieve.
- Returns a promise witch forwards:
  - on success: a [AnchorIDsPage](#object_anchorIdsPage) object containing the list (possibly empty) of the identifiers of all public anchors corresponding to the hash.
  - on error: 
    - the request's [statusText](https://developer.mozilla.org/fr/docs/Web/API/Response/statusText) for any other case.

### Get the anchoring receipt of a Woleet public anchor

**`woleet.receipt.get(anchorID)`**

- Parameters:
    - `anchorID`: the identifier of the anchor to retrieve.
- Returns a promise witch forwards:
  - on success: a [Receipt](#object_receipt) object.
  - on error: 
    - `not_found` if the anchor does not exist or is not public.
    - the request's [statusText](https://developer.mozilla.org/fr/docs/Web/API/Response/statusText) for any other case.

### Get a Bitcoin transaction

**`woleet.transaction.get(txid)`**

- Parameters:
    - `txid`: the identifier of the Bitcoin transaction to retrieve.
- Returns a promise witch forwards:
  - on succeed: a [Transaction](#object_transaction) object.
  - on error: 
    - `transaction_not_found` if the transaction does not exits on the Bitcoin blockchain.
    - the request's [statusText](https://developer.mozilla.org/fr/docs/Web/API/Response/statusText) for any other case.

### Set the Bitcoin transaction provider

**`woleet.transaction.setDefaultProvider(provider)`**

- Parameter:
    - `provider: the provider to use as default provider: "woleet.io", "blockcypher.com" or "chain.so" (default is "woleet.io").

## Dependencies

Woleet web libraries are provided as 5 separate javascript files. For convenience, all these files are also wrapped
into a single *woleet-weblibs.js* file and minified versions are available.

  - *woleet-verify.js* provides file verification methods. It relies on:
    - *woleet-chainpoint.js*
    - *woleet-api.js*
    - *woleet-hashfile.js* (optional)

  - *woleet-chainpoint.js* provides the receipt.validate method, it relies on
    - *woleet-api.js*

  - *woleet-hashfile.js* provides the file.Hasher class witch is an interface to hash files, it relies on:
    - *crypto-js.js* library (optional): only if the browser does not support workers
    - *woleet-hashfile-worker.js*

  - *woleet-hashfile-worker.js* defines a worker used to hash files, it needs:
    - *crypto-js.js* library (only to be accessible, not to include)
    
  - *woleet-api.js* provides miscellaneous method wrapping the Woleet API
    
## Objects definitions

### <a name="object_transaction"></a>Transaction object
```
{
    txId: {String} identifier of the transaction
    confirmations: {Number} number of confirmations of the block containing the transaction
    confirmedOn: {Date} confirmation date of the block containing the transaction
    blockHash: {String} identifier of the block containing the transaction
    opReturn: {String} OP_RETURN of the transaction
}
```
#### Example
```json
{
    "blockHash": "00000000000000000276fb1e87fa581e09d943f198a8b9114167df0e2230c247",
    "confirmations": 3897,
    "confirmedOn": "Wed Nov 23 2016 16:21:54 GMT+0100 (CET)",
    "opReturn": "bf53f456227b377527349f337b8d11687e461a6ff01790deadb862bf1fa57fe9",
    "txId": "0e50313029143187a44bf9fa9b9f08bf1b349291787ad8eeec2d09a2a5aaa1c5"
}
```

### <a name="object_proof"></a>Proof object
```
{
    confirmations: {Number} number of confirmations of the block containing the transaction
    confirmedOn: {Date} confirmation date of the block containing the transaction
    receipt: {Receipt} anchoring receipt
}
```
#### Example
```json
{
    "confirmedOn": "Wed Nov 23 2016 16:21:54 GMT+0100 (CET)",
    "confirmations": 3897,
    "receipt": [object Receipt]
}
```

### <a name="object_anchorIdsPage"></a>AnchorIDsPage object
```
{
    content: {String[]} array of anchor identifiers
    totalPages: {Number} total number of pages available
    totalElements: {Number} total number of anchor identifiers available
    first: {boolean} true if the current page is the first one
    last: {boolean} true if the current page is the last one
    numberOfElements: {Number} number of anchors identifier on the current page
    size: {Number} size of the current page
    number: {Number} index of the current page number (starting from 0)
}
```
#### Example
```json
{
    "content": [
      "c2f25d10-eae5-413c-82eb-1bdb6cf499b6",
      "aef56767-feef-0123-9000-1bdb6cf499b6"
    ],
    "totalPages": 1,
    "totalElements": 1,
    "last": true,
    "sort": null,
    "first": true,
    "numberOfElements": 1,
    "size": 20,
    "number": 0
}
```

### <a name="object_receipt"></a>Receipt object

The receipt object matches the [Chainpoint 1.0](http://www.chainpoint.org/#v1x) format.

##### Example
```json
{
    "header": {
        "chainpoint_version": "1.0",
        "hash_type": "SHA-256",
        "merkle_root": "bf53f456227b377527349f337b8d11687e461a6ff01790deadb862bf1fa57fe9",
        "tx_id": "0e50313029143187a44bf9fa9b9f08bf1b349291787ad8eeec2d09a2a5aaa1c5",
        "timestamp": 1479831225
    },
    "target": {
        "target_hash": "0bf8e69866ff5db9efc108ea87953081ba627fb524a2c457dfb6c1b7df9430f9",
        "target_uri": "https://www.someurl.com/target/id",
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
}
```

### <a name="object_fileList"></a>FileList object

See https://developer.mozilla.org/fr/docs/Web/API/FileList

### <a name="object_file"></a>File object

See https://developer.mozilla.org/fr/docs/Web/API/File