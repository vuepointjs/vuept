/*
  config.local.js

    This file overrides baseline settings in config.json. But LoopBack docs indicate that
    only top-level value types can be overridden in this way. See:

      https://loopback.io/doc/en/lb3/Environment-specific-configuration.html#application-wide-configuration
*/
'use strict';

const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development' || env === 'test';
const httpOnly = !!process.env.HTTP_ONLY;

const suiteKey = process.env.npm_package_config_vp_suite_key;
const appKey = process.env.npm_package_config_vp_app_key;
const solutionData = require('@vuept_solution/data');
const suiteData = solutionData.getters.suiteByKey(suiteKey);
const appData = solutionData.getters.appByKey(suiteData, appKey);

const config = {
  restApiRoot: '/api/v1',
  host: process.env.API_HOST,
  port: isDev || httpOnly ? appData.devPorts.api : 443,
  isDev
};

module.exports = config;
