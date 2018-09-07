'use strict';

module.exports = function(server) {
  let router = server.loopback.Router();

  // Optionally (based on env var) install a home `/` route that simply returns server status
  const isHomeStatusOnly = process.env.HOME_STATUS_ONLY;
  if (isHomeStatusOnly) {
    router.get('/', server.loopback.status());
    server.use(router);
  }
};
