/*
  component-config.local.js

    This file overrides baseline settings in component-config.json.
*/
'use strict';
// console.log('\x1b[33m%s\x1b[0m', `>>> >>> BOOT: ${__filename}`);

const solutionRole = process.env.npm_package_config_vp_solution_role;
const suiteKey = process.env.npm_package_config_vp_suite_key;
const appKey = process.env.npm_package_config_vp_app_key || null;
const vpCtx = require('@vuept_solution/data').context.fromRoleAndKeys(solutionRole, suiteKey, appKey);

const azureProfileKey = vpCtx.isDev ? 'DEV' : 'PROD';
const azureData = require('@vuept_solution/data').getters.azureProfileByKey(vpCtx.suiteData, azureProfileKey);

const explorerSecret = vpCtx.isDev ? 'explorer' : azureData.apiId;
const mountPath = `/${explorerSecret}`;
const configErrMsg = 'ERROR: Missing Suite Configuration Data';

const componentConfig = {
  'loopback-component-explorer': {
    mountPath: mountPath,
    generateOperationScopedModels: true,
    apiInfo: {
      title: vpCtx.title || configErrMsg,
      description: vpCtx.description || configErrMsg
    }
  }
};

module.exports = componentConfig;
