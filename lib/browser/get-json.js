/**
 * @param {String} url
 * @param {{method?:string, data?:string, token?:string}} options
 * @returns {Promise}
 */
function getJSON(url, options = {}) {

  return new Promise((resolve, reject) => {

    const req = new XMLHttpRequest();

    req.onload = () => {
      switch (req.status) {
        case 200:
        case 201:
          resolve(req.response);
          break;
        default:
          reject({ code: req.status });
          break;
      }
    };

    req.onerror = function () {
      reject({ code: 0 });
    };

    req.open(options.method || "GET", url, true);
    if (options.token) req.setRequestHeader("Authorization", 'Bearer ' + options.token);
    if (options.method === 'POST') req.setRequestHeader('Content-Type', 'application/json');
    req.setRequestHeader('Accept', 'application/json');
    req.responseType = 'json';
    req.json = 'json';

    req.send(JSON.stringify(options.data));
  });
}

module.exports = getJSON;
