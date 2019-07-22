/**
 * @param {String} url
 * @param {{method?:string, data?:string, token?:string}} options
 * @returns {Promise}
 */
function getJSON(url, options = {}) {
  const req = new XMLHttpRequest();
  return new Promise((resolve, reject) => {
    req.onload = () => {
      switch (req.status) {
        case 200:
        case 201:
          typeof req.response === 'string' ? resolve(JSON.parse(req.response)) : resolve(req.response);
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
    if (options.token) req.setRequestHeader("Authorization", "Bearer " + options.token);
    if (options.method === 'POST') req.setRequestHeader('Content-Type', 'application/json');
    req.setRequestHeader('Accept', 'application/json');
    req.responseType = "json";
    req.json = "json";
    req.send(typeof options.data === 'object' ? JSON.stringify(options.data) : options.data);
  });
}

module.exports = getJSON;
