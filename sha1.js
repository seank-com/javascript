/*jslint indent: 2, node: true, stupid: true, nomen: true */
/*global */

var crypto = require('crypto'),
  access_key = "test_key",
  hmac = crypto.createHmac("sha1", access_key),
  string_to_sign = "GET /user\\nFri, 17 Feb 2012 23:34:53 GMT";

console.log("String to sign:");
console.log(string_to_sign);
hmac.update(string_to_sign, "utf8");
console.log("Signature:");
console.log(hmac.digest('base64'));

