/*
  middleware.local.js

    This file overrides baseline settings in middleware.json.
*/
'use strict';
// console.log('\x1b[33m%s\x1b[0m', `>>> >>> BOOT: ${__filename}`);

const path = require('path');
const solutionRole = process.env.npm_package_config_vp_solution_role;
const suiteKey = process.env.npm_package_config_vp_suite_key;
const appKey = process.env.npm_package_config_vp_app_key || null;
const vpCtx = require('@vuept_solution/data').context.fromRoleAndKeys(solutionRole, suiteKey, appKey);

let clientPath = '../client';
if (!vpCtx.isTemplateDev) {
  clientPath = vpCtx.sourcePath.replace('/app', '/api');
  clientPath = path.join(clientPath, 'client');
}

// console.log(`>>> Client path: ${clientPath}`);

const middleware = {
  'final:after': {
    'strong-error-handler': {
      params: {
        debug: vpCtx.isDev,
        log: vpCtx.isDev
      }
    }
  },
  files: {
    'loopback#static': {
      params: clientPath
    }
  }
};

module.exports = middleware;
