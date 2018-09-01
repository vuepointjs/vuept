/*
  config.local.js

    This file overrides baseline settings in config.json. But LoopBack docs indicate that
    only top-level value types can be overridden in this way. See:

      https://loopback.io/doc/en/lb3/Environment-specific-configuration.html#application-wide-configuration
*/
'use strict';

var env = process.env.NODE_ENV || 'development';
var isDev = env === 'development' || env === 'test';
var httpOnly = !!process.env.HTTP_ONLY;

const config = {
  restApiRoot: '/api/v1',
  host: process.env.API_HOST,
  port: isDev || httpOnly ? 33880 : 443,
  isDev
};

module.exports = config;
