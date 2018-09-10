'use strict';
// console.log('\x1b[33m%s\x1b[0m', `>>> >>> BOOT: ${__filename}`);

module.exports = function(server) {
  let router = server.loopback.Router();

  // Optionally (based on env var) install a home `/` route that simply returns server status
  const isHomeStatusOnly = process.env.HOME_STATUS_ONLY;
  if (isHomeStatusOnly) {
    router.get('/', server.loopback.status());
    server.use(router);
  }
};
