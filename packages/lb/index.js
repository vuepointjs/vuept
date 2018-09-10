const isInfoOnly = process.env.INFO_ONLY;
const path = require('path');
const tlsConfig = require('./.tls/tls');

const server = {
  start(dotenvConfig, boot, app, http, https, serverDirAPI, isServerStartup) {
    if (dotenvConfig.error) {
      if (isInfoOnly) console.log('Error reading .env file.');
      else throw dotenvConfig.error;
    }
    // console.dir(dotenvConfig);

    app.start = function(httpOnly) {
      // console.log('\x1b[33m%s\x1b[0m', '>>> In LoopBack app.start callback');

      if (httpOnly === undefined) {
        httpOnly = process.env.HTTP_ONLY;
      }

      // Init server
      let lbServer = null;
      if (!httpOnly) {
        let options = {
          key: tlsConfig.key,
          cert: tlsConfig.cert
        };
        lbServer = https.createServer(options, app);
      } else {
        lbServer = http.createServer(app);
      }

      // Start the LoopBack web server
      lbServer.listen(app.get('port'), function() {
        let host = app.get('host');
        if (host === '0.0.0.0') host = 'localhost';
        let baseUrl = (httpOnly ? 'http://' : 'https://') + host + ':' + app.get('port');
        app.emit('started', baseUrl);
        console.log('Web server listening at: %s%s', baseUrl, '/');

        if (app.get('loopback-component-explorer')) {
          let explorerPath = app.get('loopback-component-explorer').mountPath;
          console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
        }
      });
      return lbServer;
    };

    // Bootstrap the application, configure models, datasources and middleware.
    // Sub-apps like REST API are mounted via boot scripts.
    let baseDirVP = path.dirname(require.resolve('@vuept/lb/package.json'));
    let serverDirVP = path.join(baseDirVP, 'server');
    let modelSourcesDirAPI = path.resolve(serverDirAPI, '../common/models');
    let modelSourcesDirVP = path.join(baseDirVP, 'models');
    let bootDirAPI = path.resolve(serverDirAPI, './boot');
    let bootDirVP = path.join(baseDirVP, 'server/boot');

    let bootOptions = {
      appRootDir: serverDirAPI, // Always use local server dir as baseline location for configs, models, client, etc.
      appConfigRootDir: serverDirVP, // config.json: Common pkg w/ suite data driven config/logic
      modelsRootDir: serverDirAPI, // model-config.*.json: Model config is always locally-specific and best as JSON data, not JS
      dsRootDir: serverDirAPI, // datasources.json/js: Datasources are always locally-specific
      middlewareRootDir: serverDirVP, // middleware.json/js: Common pkg w/ suite-data-driven config/logic. favicon+client paths, incl. default client files in VP pkg
      componentRootDir: serverDirVP, // component-config.json/js: Common pkg w/ suite data driven config/logic
      modelSources: [modelSourcesDirVP, modelSourcesDirAPI], // Typically local, but common pkg models in some cases
      bootDirs: [bootDirVP, bootDirAPI] // Typically common pkg boot logic, but local overrides honored
    };

    console.log('Booting up LoopBack version %s (%s)...', app.loopback.version, process.env.NODE_ENV);

    boot(app, bootOptions, function(err) {
      if (err) throw err;

      // start the server if `$ node server.js`
      if (isServerStartup) app.start();

      console.log('LoopBack Bootup completed.');
    });
  }
};

module.exports = {
  server
};
