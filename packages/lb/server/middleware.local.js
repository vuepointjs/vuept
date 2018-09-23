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

const azureProfileKey = vpCtx.isNodeDev ? 'DEV' : 'PROD';
const azureData = require('@vuept_solution/data').getters.azureProfileByKey(vpCtx.suiteData, azureProfileKey);

let apiSourceRootPath = vpCtx.isDevOpsCommand ? __dirname : vpCtx.sourcePath.replace(`${path.sep}app`, `${path.sep}api`);
let clientPath = '$!../client';
let modelsPath = path.join(apiSourceRootPath, 'common/models');
let azureApiIdPiece = azureData.apiId.split('-', 1);

// Static json data APIs don't do jwt token checks, but we slightly obscure the URL w/ the first 8 hex of the ApiId.
// Obviously, sensitive data should not be exposed and served in this way
let modelsUrlPath = `/api/static/${azureApiIdPiece ? azureApiIdPiece[0] : 'eeeeeeee'}/models`;
// console.log(`API static endpoints... models url path: ${modelsUrlPath}`);

if (vpCtx.isTemplateDev) {
  clientPath = path.join(__dirname, '../client');
} else {
  clientPath = path.join(apiSourceRootPath, 'client');
}
// console.log(`API source root path: ${apiSourceRootPath}`);
// console.log(`API client path: ${clientPath}`);

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
        paths: [modelsUrlPath],
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
