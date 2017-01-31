# Woleet Web libraries

This repository contains the sources code of **Woleet Web libraries**.
These libraries are aimed at:
- verifying the integrity and timestamp of files anchored by Woleet,
- verifying the integrity and timestamp of files anchored by third parties using [Chainpoint 1.0](http://www.chainpoint.org/#v1x) compatible receipts,
- computing the SHA256 hashes of any file (even larger than 50MB).

### Installation 
Before using **woleet-hash** you need to install the **[crypto-js](https://github.com/brix/crypto-js)** lib in order 
to perform hash on files.

Type `bower install` on the project's root to install this dependency.

### Initialization

In order to use this library you have to include the following components:
```html
<script src="./lib/woleet-api.js"></script>
<script src="./lib/woleet-hashfile.js"></script> <!-- Optional, only if you have to hash files-->
<script src="./lib/woleet-chainpoint.js"></script>
<script src="./lib/woleet-verify.js"></script>

<!-- CryptoJS is optional. Required only if you have to hash files without workers -->
<script src="./bower_components/crypto-js/core.js"></script>
<script src="./bower_components/crypto-js/sha256.js"></script>
<script src="./bower_components/crypto-js/lib-typedarrays.js"></script>
```

or the minimized equivalent:

```html
<script src="./dist/woleet-verify.min.js"></script>
```

**Note**: worker.js is accessed only by woleet-hashfile.js and must not be specifically included on the web page. 

## Main methods:

**Note**: all the methods will be contained in the same object (the "woleet" variable).
For example, to get a transaction, the code will be: `woleet.transaction.get(transactionID)`

### Methods provided by woleet-verify:
verify.WoleetDAB(file)
- Param file: a File object ***or*** a SHA256 hash (as an hexadecimal characters String).
- Returns a Promise witch forwards:
  - if succeed: a list of Proof* object (can be empty).
  - if error: 
    - any error thrown by [receipt.validate](#chainpoint) (see below).
    - any error thrown by the [Hasher](#hashfile) object (see below).
    - file_matched_but_anchor_not_yet_processed: the file has a match in our database but is waiting for anchoring.
    - missing_woleet_hash_dependency: if woleet-hashfile.js is not included while passing a File object as argument.
    - missing_woleet_hash_dependency: if woleet-hashfile.js is not included while passing a File object as argument.

See example at [example_woleetDAB.html](example/example_woleetDAB.html)
    
verify.DAB(file, receipt)
- Param file: a File object ***or*** a sha256 hash (as an hexadecimal characters String)
- Returns a Promise witch forwards:
  - if succeed: a [Proof](#object_proof)* object.
  - if error: 
    - any error thrown by [receipt.validate](#chainpoint) (see below).
    - any error thrown by the [Hasher](#hashfile) object (see below).
    - missing_woleet_hash_dependency: if woleet-hashfile.js is not included while passing a File object as first argument.
    - target_hash_mismatch: the receipt's target is not mean for the file.
    - transaction_not_found: the proof linked by the receipt cannot be found.
    - opReturn_mismatches_merkleRoot: the proof value mismatches the receipt's one.
    
See example at [example_DAB.html](example/example_DAB.html)

## Advanced methods:
### <a name="chainpoint"></a>Methods provided by woleet-chainpoint:
 
receipt.validate(receipt)
- Param receipt: a JSON parsed Chainpoint 1.0 receipt
- Returns: 
    - true if the receipt is valid.
    - throws an error if not:
        - invalid_receipt_format: the receipt does not match the chainpoint 1.x format.
        - invalid_target_proof: missing attribute in proof (parent or left or right).
        - invalid_parent_in_proof_element: parent does not match the sha256(left+right).
        - non_sha256_target_proof_element: an attribute in proof (parent or left or right) in not a sha256 sum.
        - merkle_root_mismatch: the proof result does not match the receipt's merkle_root attribute.

See example at [verifyReceipt.html](example/verifyReceipt.html)

### <a name="hashfile"></a>Methods provided by woleet-hashfile: 

You can instance a Hasher object with `var myHasher = new woleet.file.Hasher`, this object provide an interface to hash files in the browser:

myHasher.on(event, callback):

- Params event (a String corresponding to an event name), callback (a Function):
    - event = "start",      callback = function ({start:Boolean (always true), file:File})
    - event = "progress",   callback = function ({progress:Number (Float), file:File})
    - event = "error",      callback = function ({error:Error, file:File})
    - event = "result",     callback = function ({result:Hash (file hash), file:File})

myHasher.start(files): 
- Param files: a [FileList](#objectFileList)* object.
- Throws:
    - file_too_big_to_be_hashed_without_worker: web worker are not available on the browser and the file exceeds the maximum size of the non-worker hash function.
    - invalid_parameter: The parameter is not a File nor a FileList.
    - not_ready: the _hasher_ is already working, you must wait that it has finished.
    - no_viable_hash_method: workers are not supported by the browser ***and*** crypto-js lib is not included on the page (crypto-js is already included in woleet-verify.min.js).

myHasher.isReady(): 
- Returns a boolean that indicates if the hasher is working (you cannot hash files if it is already working).

### Methods provided by woleet-api: 

receipt.get(anchorID):
- Param anchorID: an anchor id.
- Returns a promise witch forwards:
  - if succeed: a [Receipt](#object_receipt)* object.
  - if error: 
    - "not_found" if the returned status where 404.
    - the request's [statusText](https://developer.mozilla.org/fr/docs/Web/API/Response/statusText) for any other case.

transaction.get(txid): 
- Param txid: a bitcoin transaction id.
- Returns a promise witch forwards:
  - if succeed: a [Transaction](#object_transaction)* object.
  - if error: 
    - transaction_not_found if the returned status where 404.
    - the request's [statusText](https://developer.mozilla.org/fr/docs/Web/API/Response/statusText) for any other case.

transaction.setDefaultProvider(api): 
- Param api: a string "woleet.io" _or_ "blockcypher.com" _or_ "chain.so" (default is "chain.so").

anchor.getAnchorIDs(hash[, size]):
- Param hash: a file hash (as String).
- Param size (optional): integer setting the page size (default: 20).
- Returns a promise witch forwards:
  - if succeed: a [AnchorIDsPage](#object_anchorIdsPage)* object (containing a list of the public anchors IDs corresponding to the file hash). Note that the list may be empty (it won't throw a "not_found" error).
  - if error: 
    - the request's [statusText](https://developer.mozilla.org/fr/docs/Web/API/Response/statusText) for any other case.


See example in [hashfile.html](examples/hashfile.html)

### Limitations

This library has been tested for Internet Explorer 11, as it does not support promises, you will have to 
include a third party library as [bluebird](http://bluebirdjs.com/) and 
set `<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />` in 
your page to make it work (see examples files).

Some browsers won't support [workers](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker),
in this case, hashing files is still possible for files whose size does not exceed 50MB.

Receipts format must be [Chainpoint 1.0](http://www.chainpoint.org/#v1x) compatible.

### Dependencies description:
There are 5 files that you can include in order to perform chainpoint verifications:
  - *woleet-verify* provides main methods verify.woleetDAB *and* verify.DAB, it relies on:
    - woleet-chainpoint
    - woleet-api
    - woleet-hashfile (optional)

  - *woleet-chainpoint* provides the receipt.validate method, it relies on
    - woleet-api

  - *woleet-hashfile* provides the file.Hasher class witch is an interface to hash files, it relies on:
    - crypto-js library (optional): only if the browser does not support workers (see Limitations)
    - worker

  - *woleet-api* provides miscellaneous method in order to use the woleet api

  - *worker* defines a worker used to hash files, it needs:
    - crypto-js library (only to be accessible, not to include)
    
### Objects definitions:

#### <a name="object_transaction"></a>*Transaction object: 
```
{
    txId: String corresponding to the id of the transaction
    confirmations: Number corresponding to the number of confirmations
    confirmedOn: Date corresponding to the block confirmation
    blockHash: String corresponding to the block hash (id)
    opReturn: String corresponding to the op_return of the transaction
}
```
##### Example: 
```json
{
    "blockHash": "00000000000000000276fb1e87fa581e09d943f198a8b9114167df0e2230c247",
    "confirmations": 3897,
    "confirmedOn": "Wed Nov 23 2016 16:21:54 GMT+0100 (CET)",
    "opReturn": "bf53f456227b377527349f337b8d11687e461a6ff01790deadb862bf1fa57fe9",
    "txId": "0e50313029143187a44bf9fa9b9f08bf1b349291787ad8eeec2d09a2a5aaa1c5"
}
```

#### <a name="object_proof"></a>*Proof object: 
```
{
    confirmations: Number corresponding to the number of confirmations
    confirmedOn: Date corresponding to the block confirmation
    receipt: Receipt correesponding to the proof of existence
}
```
##### Example: 
```
{
    "confirmedOn": "Wed Nov 23 2016 16:21:54 GMT+0100 (CET)",
    "confirmations": 3897,
    "receipt": [object Receipt]
}
```

#### <a name="object_anchorIdsPage"></a>*AnchorIDsPage object: 
```
{
    content: array of anchorID (as String)
    totalPages: number of pages with the current page size
    totalElements: total of elements matching the request
    last: boolean that indicates if the current page is the last one
    first: boolean that indicates if the current page is the first one
    numberOfElements: number of elements matching the request on the current page
    size: current page size
    number: current page number (starting from 0)
}
```
##### Example: 
```json
{
    "content": [
      "c2f25d10-eae5-413c-82eb-1bdb6cf499b6"
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

#### <a name="object_receipt"></a>*Receipt object: 
The receipt object matches the [Chainpoint 1.0](http://www.chainpoint.org/#v1x) format.

##### Example: 
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

#### <a name="object_FileList"></a>*FileList object: 
See https://developer.mozilla.org/fr/docs/Web/API/FileList

#### <a name="object_FIle"></a>*File object: 
See https://developer.mozilla.org/fr/docs/Web/API/File