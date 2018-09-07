/*
  component-config.local.js

    This file overrides baseline settings in component-config.json.
*/
'use strict';

const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development' || env === 'test';

const suiteKey = process.env.npm_package_config_vp_suite_key;
const appKey = process.env.npm_package_config_vp_app_key;
const solutionData = require('@vuept_solution/data').getters;
const suiteData = solutionData.suiteByKey(suiteKey);
const appData = solutionData.appByKey(suiteData, appKey);
const azureProfileKey = isDev ? 'DEV' : 'PROD';
const azureData = solutionData.azureProfileByKey(suiteData, azureProfileKey);

const tenantKey = suiteData.tenantKey;
const suiteShortName = suiteData.name;
const appShortName = appData.name;
const appLongName = appData.longName;

const explorerSecret = isDev ? 'explorer' : azureData.apiId;
const mountPath = `/${explorerSecret}`;

const apiTitle = `${tenantKey} ${suiteShortName} API - ${appShortName} (${appKey})`;
const apiDescription = `Application Programming Interface (API) for ${appLongName}`;

const componentConfig = {
  'loopback-component-explorer': {
    mountPath: mountPath,
    generateOperationScopedModels: true,
    apiInfo: {
      title: apiTitle,
      description: apiDescription
    }
  }
};

module.exports = componentConfig;
