/*
  config.local.js

    This file overrides baseline settings in config.json. But LoopBack docs indicate that
    only top-level value types can be overridden in this way. See:

      https://loopback.io/doc/en/lb3/Environment-specific-configuration.html#application-wide-configuration
*/
'use strict';
// console.log('\x1b[33m%s\x1b[0m', `>>> >>> BOOT: ${__filename}`);

const httpOnly = !!process.env.HTTP_ONLY;
const solutionRole = process.env.npm_package_config_vp_solution_role;
const suiteKey = process.env.npm_package_config_vp_suite_key;
const appKey = process.env.npm_package_config_vp_app_key || null;
const vpCtx = require('@vuept_solution/data').context.fromRoleAndKeys(solutionRole, suiteKey, appKey);

const config = {
  restApiRoot: '/api/v1',
  host: process.env.API_HOST,
  port: vpCtx.isDev || httpOnly ? vpCtx.port : 443,
  isDev: vpCtx.isDev
};

module.exports = config;
