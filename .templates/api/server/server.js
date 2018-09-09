'use strict';

console.log('----------');
console.log('>>> Starting LoopBack API server...');

// Attempt to read .env file
console.log('Read env variables in .env file.');
const dotenv = require('dotenv');
const dotenvConfig = dotenv.config();
const isInfoOnly = process.env.INFO_ONLY;
if (dotenvConfig.error) {
  if (isInfoOnly) console.log('Error reading .env file.');
  else throw dotenvConfig.error;
}

var path = require('path');
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
    var host = app.get('host');
    if (host === '0.0.0.0') host = 'localhost';
    var baseUrl = (httpOnly ? 'http://' : 'https://') + host + ':' + app.get('port');
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

let baseDirVP = path.dirname(require.resolve('@vuept/lb/package.json'));

let serverDirLocal = __dirname;
let serverDirVP = path.join(baseDirVP, 'server');

let modelSourcesDirLocal = path.resolve(__dirname, '../common/models');
let modelSourcesDirVP = path.join(baseDirVP, 'models');

let bootDirLocal = path.resolve(__dirname, './boot');
let bootDirVP = path.join(baseDirVP, 'server/boot');

let bootOptions = {
  appRootDir: serverDirLocal, // Always use local server dir as baseline location for configs, models, client, etc.
  appConfigRootDir: serverDirVP, // config.json: Common pkg w/ suite data driven config/logic
  modelsRootDir: serverDirLocal, // model-config.*.json: Model config is always locally-specific and best as JSON data, not JS
  dsRootDir: serverDirLocal, // datasources.json/js: Datasources are always locally-specific
  middlewareRootDir: serverDirVP, // middleware.json/js: Common pkg w/ suite data driven config/logic. favicon+client (static) paths, incl. default client files in VP pkg
  componentRootDir: serverDirVP, // component-config.json/js: Common pkg w/ suite data driven config/logic
  modelSources: [modelSourcesDirVP, modelSourcesDirLocal], // Typically local, but common pkg models in some cases
  bootDirs: [bootDirVP, bootDirLocal] // Typically common pkg boot logic, but local overrides honored
};

boot(app, bootOptions, function(err) {
  if (err) throw err;

  console.log('Booting up LoopBack version %s (%s)...', app.loopback.version, process.env.NODE_ENV);

  // start the server if `$ node server.js`
  if (require.main === module) app.start();

  console.log('Bootup completed.');
});
