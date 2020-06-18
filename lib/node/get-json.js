const request = require('request');
const URL = require('url');

/**
 * @param {String} url
 * @param {{method?:string, data?:string, token?:string}} options
 * @returns {Promise}
 */
function getJSON(url, options = {}) {

  return new Promise((resolve, reject) => {

    let requestOptions = {
      url: url,
      method: options.method || 'GET',
      gzip: true,
      json: true
    };
    if (options.data) requestOptions.body = options.data;
    if (options.token) requestOptions.headers['Authorization'] = 'Bearer ' + options.token;

    request(requestOptions, (err, res, body) => {
      if (err) {
        reject({ code: 0 });
        return;
      }
      switch (res.statusCode) {
        case 200:
        case 201:
          resolve(body);
          break;
        default:
          reject({ code: res.statusCode });
          break;
      }
    });
  });
}

module.exports = getJSON;
