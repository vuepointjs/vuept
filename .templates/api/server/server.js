'use strict';

// Attempt to read .env file
console.log('Read env variables in .env file.');
const dotenv = require('dotenv');
const dotenvConfig = dotenv.config();
if (dotenvConfig.error) {
  throw dotenvConfig.error;
}

var loopback = require('loopback');
var boot = require('loopback-boot');
var app = (module.exports = loopback());

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
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
