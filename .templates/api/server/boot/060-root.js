'use strict';

module.exports = function(server) {
  var router = server.loopback.Router();

  // Optionally (based on env var) install a home `/` route that simply returns server status
  const envVarHome = process.env.VP_LB_HOME;
  if (envVarHome && envVarHome.toUpperCase() === 'STATUS') {
    router.get('/', server.loopback.status());
    server.use(router);
  }
};
