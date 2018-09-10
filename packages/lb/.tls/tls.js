var path = require('path');
var fs = require("fs");

exports.key = fs.readFileSync(path.join(__dirname, 'tls.key')).toString();
exports.cert = fs.readFileSync(path.join(__dirname, 'tls.crt')).toString();
