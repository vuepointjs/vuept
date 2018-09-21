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

let apiRootPath = vpCtx.isDevOpsCommand ? __dirname : vpCtx.sourcePath.replace(`${path.sep}app`, `${path.sep}api`);
let clientPath = '$!../client';
let modelsPath = path.join(apiRootPath, 'common/models');

if (vpCtx.isTemplateDev) {
  clientPath = path.join(__dirname, '../client');
} else {
  clientPath = path.join(apiRootPath, 'client');
}

const middleware = {
  'initial:before': {
    'loopback#favicon': {
      params: '$!../client/favicon.ico'
    }
  },
  // initial: {
  //   'helmet#frameguard': {
  //     params: ['sameorigin']
  //   }
  // },
  files: {
    'loopback#static': [
      {
        name: 'client',
        paths: ['/'],
        params: clientPath
      },
      {
        name: 'models',
        paths: ['/zz'],
        params: modelsPath
      }
    ]
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
