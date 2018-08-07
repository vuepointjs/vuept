/*
  middleware.local.js

    This file overrides baseline settings in middleware.json.
*/
'use strict';

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
