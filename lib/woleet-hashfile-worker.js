/**
 * @namespace woleet
 */

const _in_worker = true;

/* crypto-js lib: minified version */
importScripts('woleet-crypto.min.js');

let hash = null;

self.onmessage = (event) => {
    try {
        switch (event.data.action) {
            case 'start' :
                if (hash) throw new Error('not_ready');
                hash = woleet.crypto.createHash('sha256');
                postMessage({start: true});
                break;
            case 'update' :
                hash.update(new Uint8Array(event.data.chunk));
                postMessage({progress: true});
                break;
            case 'finalize' :
                postMessage({result: hash.digest('hex')});
                hash = null;
                break;
        }
    } catch (error) {
        postMessage({error: error.message});
    }
};