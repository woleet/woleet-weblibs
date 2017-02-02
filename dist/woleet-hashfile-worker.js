/* crypto-js lib: minified version */
importScripts('crypto.min.js');
/* crypto-js lib: regular version */
//importScripts('bower_components/crypto-js/core.js');
//importScripts('bower_components/crypto-js/lib-typedarrays.js');
//importScripts('bower_components/crypto-js/sha256.js');

self.addEventListener('message', function (e) {

    var file = e.data;

    //noinspection JSUnresolvedFunction
    postMessage({start: true, file: file});
    var maxBlockSize = 1e7;

    var hashByBlock = function (file, _maxBlockSize) {
        var maxBlockSize = _maxBlockSize || 0xffffff;
        var sha256 = CryptoJS.algo.SHA256.create();

        var totalFileSize = file.size,
            start = 0,
            stop = maxBlockSize,
            hash,
            readSlicer,
            fileSlicer,
            chunk,
            chunkUint8;

        while (true) {
            //noinspection JSUnresolvedFunction
            readSlicer = new FileReaderSync();
            fileSlicer = file.slice(start, stop);
            //noinspection JSUnresolvedFunction
            postMessage({progress: start / file.size, file: file});

            chunk = readSlicer.readAsArrayBuffer(fileSlicer);
            chunkUint8 = new Uint8Array(chunk);
            var wordArr = CryptoJS.lib.WordArray.create(chunkUint8);
            hash = sha256.update(wordArr);

            /* Helps the interpreter to free memory */
            chunk = null;
            chunkUint8 = null;
            wordArr = null;
            readSlicer = null;

            /* Checks if file hash is done or not
             * if so, finalise hash
             * else increase block offset */

            start = stop;
            stop += maxBlockSize;

            if (start >= totalFileSize) {
                hash.finalize();
                return hash._hash.toString(CryptoJS.enc.Hex);
            }
        }
    };

    var hashChunk = function (file) {
        var start = 0;
        var stop = file.size;
        //noinspection JSUnresolvedFunction
        var reader = new FileReaderSync();
        var blob = file.slice(start, stop);
        var chunk = reader.readAsArrayBuffer(blob);
        var chunkUint8 = new Uint8Array(chunk);
        var wordArr = CryptoJS.lib.WordArray.create(chunkUint8);
        return (CryptoJS.SHA256(wordArr)).toString();
    };

    var hash;

    try {
        if (file.size > maxBlockSize) {
            hash = hashByBlock(file);
        }
        else {
            hash = hashChunk(file);
        }
        //noinspection JSUnresolvedFunction
        postMessage({result: hash, file: file});
    } catch (err) {
        //noinspection JSUnresolvedFunction
        postMessage({error: err, file: file});
    } finally {
        //close();
    }
}, false);