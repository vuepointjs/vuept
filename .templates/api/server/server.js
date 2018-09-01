'use strict';

// Attempt to read .env file
console.log('Read env variables in .env file.');
const dotenv = require('dotenv');
const dotenvConfig = dotenv.config();
if (dotenvConfig.error) {
  throw dotenvConfig.error;
}

var http = require('http');
var https = require('https');
var tlsConfig = require('../.tls/tls');
var loopback = require('loopback');
var boot = require('loopback-boot');
var app = (module.exports = loopback());

app.start = function(httpOnly) {
  if (httpOnly === undefined) {
    httpOnly = process.env.HTTP_ONLY;
  }

  // Init server
  var server = null;
  if (!httpOnly) {
    var options = {
      key: tlsConfig.key,
      cert: tlsConfig.cert
    };
    server = https.createServer(options, app);
  } else {
    server = http.createServer(app);
  }

  // Start the web server
  server.listen(app.get('port'), function() {
    var baseUrl = (httpOnly ? 'http://' : 'https://') + app.get('host') + ':' + app.get('port');
    app.emit('started', baseUrl);
    console.log('Web server listening at: %s%s', baseUrl, '/');

    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
  return server;
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  console.log('Booting up LoopBack version %s (%s)...', app.loopback.version, process.env.NODE_ENV);

  // start the server if `$ node server.js`
  if (require.main === module) app.start();

  console.log('Bootup completed.');
});
