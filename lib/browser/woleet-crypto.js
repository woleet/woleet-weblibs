if ((typeof _in_worker === 'undefined') && (typeof window === 'undefined')) {
  throw new Error('This module is not meant to be used by node')
}

const CryptoJS = (((factory) => factory(
  require("crypto-js/core"),
  require("crypto-js/sha224"),
  require("crypto-js/sha256"),
  require("crypto-js/sha384"),
  require("crypto-js/sha512"),
  require("crypto-js/lib-typedarrays")
))(CryptoJS => CryptoJS));

const WordArray = CryptoJS.lib.WordArray;

/**
 * @param alg
 * @returns {{}}
 */
function createSha(alg) {
  const hash = CryptoJS.algo[alg].create();

  const o = {};

  /**
   * @param {Buffer | Uint8Array | WordArray | string} data
   * @param {'utf8' | 'binary' | 'hex' | 'base64'} [inputEncoding]
   */
  o.update = function (data, inputEncoding) {
    let _data;
    if (data instanceof Uint8Array) {
      _data = WordArray.create(data)
    } else if (WordArray.isPrototypeOf(data)) {
      _data = data;
    } else if (inputEncoding) {
      switch (inputEncoding) {
        case 'binary':
          const len = data.length;
          const arr = new Uint8Array(len);
          for (let i = 0; i < len; i++) arr[i] = data.charCodeAt(i)
          _data = WordArray.create(arr);
          break;
        case 'hex':
          _data = CryptoJS.enc.Hex.parse(data);
          break;
        case 'utf8':
          _data = data;
          break;
        case 'base64':
        default:
          _data = WordArray.create(new Buffer(data, inputEncoding))
      }
    } else if (!data) {
      _data = WordArray.create();
    } else if (typeof data === 'string') {
      _data = data;
    } else {
      throw new TypeError();
    }
    hash.update(_data);
    return o;
  };

  /**
   * @param encoding
   * @returns {Buffer | string}
   */
  o.digest = function (encoding) {
    const hex = CryptoJS.enc.Hex.stringify(hash.finalize());
    if (encoding && encoding === 'hex') {
      return hex;
    } else {
      const bin = new Buffer(hex, 'hex');
      return encoding ? bin.toString(encoding) : bin;
    }
  };

  return o;
}

function createHash(algorithm) {
  switch (algorithm) {
    case 'sha224' :
      return createSha('SHA224');
    case 'sha256' :
      return createSha('SHA256');
    case 'sha384' :
      return createSha('SHA384');
    case 'sha512' :
      return createSha('SHA512');
    default:
      throw new Error('Hash algorithm not supported')
  }
}

module.exports = {
  createHash, CryptoJS, Buffer,
  sha256: () => createHash('sha256'),
  sha224: () => createHash('sha224'),
  sha384: () => createHash('sha384'),
  sha512: () => createHash('sha512')
};
