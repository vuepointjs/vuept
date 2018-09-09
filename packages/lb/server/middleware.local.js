/*
  middleware.local.js

    This file overrides baseline settings in middleware.json.
*/
'use strict';
console.log('\x1b[33m%s\x1b[0m', `>>> >>> BOOT: ${__filename}`);

var env = process.env.NODE_ENV || 'development';
var isDev = env === 'development' || env === 'test';

const middleware = {
  'final:after': {
    'strong-error-handler': {
      params: {
        debug: isDev,
        log: isDev
      }
    }
  }
};

module.exports = middleware;
