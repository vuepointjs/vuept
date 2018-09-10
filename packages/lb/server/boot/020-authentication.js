'use strict';
// console.log('\x1b[33m%s\x1b[0m', `>>> >>> BOOT: ${__filename}`);

module.exports = function enableAuthentication(app) {
  // enable authentication
  app.enableAuth();
};
