const crypto = require('crypto');

// export default function random64String(length = 10) {
export default function random64String(length = 10) {
  let string = crypto.randomBytes(length).toString('base64');
  string = string.replace(/\+|\/|=/g, '');
  string = string.slice(0, length);
  if (string.length < length) {
    string += random64String(length - string.length);
  }
  return string;
}
