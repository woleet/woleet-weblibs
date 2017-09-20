/**
 * @namespace woleet
 */

const _in_worker = true;

/* crypto-js lib: minified version */
importScripts('woleet-crypto.min.js');

self.addEventListener('message', function (e) {

    const file = e.data;

    //noinspection JSUnresolvedFunction
    postMessage({start: true, file: file});
    const maxBlockSize = 0xffffff;
    const min = (a, b) => a > b ? b : a;

    const hashByBlock = function (file) {
        const sha256 = woleet.crypto.sha256();

        let totalFileSize = file.size,
            start = 0, stop = maxBlockSize,
            readSlicer,
            fileSlicer,
            chunk,
            chunkUint8;

        readSlicer = new FileReaderSync();

        do {
            fileSlicer = file.slice(start, stop);
            //noinspection JSUnresolvedFunction
            postMessage({progress: start / file.size, file: file});

            chunk = readSlicer.readAsArrayBuffer(fileSlicer);
            chunkUint8 = new Uint8Array(chunk);
            sha256.update(chunkUint8);

            /* Helps the interpreter to free memory */
            chunk = null;
            chunkUint8 = null;

            /* Checks if file hash is done or not
             * if so, finalise hash
             * else increase block offset */

            start = stop;
            stop = min(stop + maxBlockSize, totalFileSize)

        } while (start < totalFileSize);

        return sha256.digest('hex');
    };

    const hashChunk = function (file) {
        const start = 0;
        const stop = file.size;
        //noinspection JSUnresolvedFunction
        const reader = new FileReaderSync();
        const blob = file.slice(start, stop);
        const chunk = reader.readAsArrayBuffer(blob);
        const chunkUint8 = new Uint8Array(chunk);
        return ((woleet.crypto.sha256()).update(chunkUint8).digest('hex'));
    };

    let hash;

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