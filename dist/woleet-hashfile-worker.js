'use strict';


var _in_worker = true;

(function () {
  try {
    importScripts('woleet-crypto.min.js');
  } catch (_ref) {
    var message = _ref.message;

    postMessage({ error: message });
    return;
  }

  var hash = null;
  self.onmessage = function (event) {
    try {
      switch (event.data.action) {
        case 'start':
          if (hash) throw new Error('not_ready');
          hash = woleet.crypto.createHash('sha256');
          postMessage({ start: true });
          break;
        case 'update':
          hash.update(new Uint8Array(event.data.chunk));
          postMessage({ progress: true });
          break;
        case 'finalize':
          postMessage({ result: hash.digest('hex') });
          hash = null;
          break;
        case 'reset':
          postMessage({ reset: true });
          hash = null;
          break;
      }
    } catch (_ref2) {
      var message = _ref2.message;

      postMessage({ error: message });
    }
  };
})();