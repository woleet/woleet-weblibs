const https = require('https');
const URL = require('url');

/**
 * @param {String} url
 * @param {{method?:string, data?:string, token?:string}} options
 * @returns {Promise}
 */
function getJSON(url, options = {}) {

  const _url = URL.parse(url);

  let postData = options.data ? JSON.stringify(options.data) : undefined;
  let requestOptions = {
    host: _url.host,
    path: _url.path,
    method: options.method || 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };

  if (options.token) requestOptions.headers['Authorization'] = 'Bearer ' + options.token;
  if (options.method === 'POST') requestOptions.headers['Content-Length'] = Buffer.byteLength(postData);
  if (postData) requestOptions.headers['Content-Type'] = 'application/json';

  return new Promise((resolve, reject) => {
    let req = https.request(requestOptions, (res) => {
      res.setEncoding('utf8');
      let resData = '';
      res.on('data', (chunk) => resData += chunk);

      res.on('error', reject);

      res.on('end', () => {
        let json = null;
        switch (res.statusCode) {
          case 200:
          case 201:
            try {
              json = JSON.parse(resData);
              resolve(json)
            } catch (err) {
              reject(err);
            }
            break;
          case 404:
            resolve(null);
            break;
          default:
            reject({code: req.statusCode});
            break;
        }
      });
    });

    if (postData) req.write(postData);

    req.on('error', () => reject({code: 0}));

    req.end();
  }).catch((err) => {
    const error = new Error('http_error');
    error.code = err.code;
    throw error;
  });
}

module.exports = getJSON;
