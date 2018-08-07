/*
  component-config.local.js

    This file overrides baseline settings in component-config.json.
*/
'use strict';

var env = process.env.NODE_ENV || 'development';
var isDev = env === 'development' || env === 'test';

const explorerSecret = isDev ? 'explorer' : 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'; // TODO: Pull App ID from @vuept/solution-data to use for this
const mountPath = `/${explorerSecret}`;

// TODO: Pull these pieces from @vuept/solution-data
const tenantKey = 'MS';
const suiteShortName = 'O365';
const appKey = 'OL';
const appShortName = 'Outlook';
const appLongName = 'Outlook Email';

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
