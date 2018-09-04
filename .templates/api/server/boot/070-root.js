'use strict';

module.exports = function(server) {
  var router = server.loopback.Router();

  // Optionally (based on env var) install a home `/` route that simply returns server status
  const envVarHomeStatusOnly = process.env.HOME_STATUS_ONLY;
  if (envVarHomeStatusOnly) {
    router.get('/', server.loopback.status());
    server.use(router);
  }
};
