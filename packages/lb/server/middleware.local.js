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
  clientPath = vpCtx.sourcePath.replace(`${path.sep}app`, `${path.sep}api`);
  clientPath = path.join(clientPath, 'client');
}

// console.log(`>>> Client path: ${clientPath}`);

const middleware = {
  'initial:before': {
    'loopback#favicon': {
      params: '$!../client/favicon.ico'
    }
  },
  files: {
    'loopback#static': {
      params: clientPath
    }
  },
  final: {
    './middleware/url-not-found-handler': {}
  },
  'final:after': {
    'strong-error-handler': {
      params: {
        debug: vpCtx.isNodeDev,
        log: vpCtx.isNodeDev
      }
    }
  }
};

module.exports = middleware;
