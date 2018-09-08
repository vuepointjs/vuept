const path = require('path');
const isTemplateDev = process.env.TDEV;
const filePath = path.resolve(__dirname, `./tenants/${isTemplateDev ? '.tdev' : 'suites'}.json`);
const lodashId = require('lodash-id');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(filePath);
const db = low(adapter);
const _ = require('lodash');

// Add lowdb methods for insert, upsert, etc. and set id field to 'key'. See: https://github.com/typicode/lodash-id
db._.mixin(lodashId);
db._.id = 'key';

// We'll need a simple Lodash memoize resolver below
const memoizeKeyResolver = (...args) => _.join(args); // JSON.stringify(args);

const getters = {
  filePath,

  allSuites: () => db.get('suites').value(),

  allSuiteKeys: () =>
    db
      .get('suites')
      .map('key')
      .value(),

  _suiteByKeyRaw: key =>
    db
      .get('suites')
      .filter({ key })
      .first()
      .value(),
  suiteByKey: null, // See assignment below after getters initialized

  suitePathByKey: key => path.resolve(__dirname, key === '__suite-key__' ? '../../.templates/suite/' : `../suite/${key.toLowerCase()}/`),

  appByKey: (suiteData, key) =>
    key
      ? _(suiteData.apps)
          .filter({ key })
          .first()
      : {},

  _appByKeysRaw(suiteKey, appKey) {
    return appKey && suiteKey
      ? _(this.suiteByKey(suiteKey).apps)
          .filter({ key: appKey })
          .first()
      : {};
  },
  appByKeys: null,

  appPathByKey: key => path.resolve(__dirname, key === '__app-key__' ? '../../.templates/app/' : `../app/${key.toLowerCase()}/`),

  appPathByRoleAndKey(role, key) {
    return role === 'suite' ? this.suitePathByKey(key) : this.appPathByKey(key);
  },

  sourcePathByRoleAndKeys(role, suiteKey, appKey) {
    switch (role) {
      case 'suite':
        return this.suitePathByKey(suiteKey);
      case 'app':
      case 'api':
        return this.appPathByKey(appKey);
      default:
        return null;
    }
  },

  buildDirByRoleAndKeys: function(role, suiteKey, appKey) {
    switch (role) {
      case 'suite':
        return suiteKey === '__suite-key__' ? `.nuxt-tdev-${role}` : `.nuxt-${suiteKey.toLowerCase()}-${role}`;
      case 'app':
      case 'api':
        return appKey === '__app-key__' ? '.nuxt-tdev-app' : `.nuxt-${suiteKey.toLowerCase()}-${appKey.toLowerCase()}`;
      default:
        return null;
    }
  },

  portByRoleAndKeys(role, suiteKey, appKey) {
    switch (role) {
      case 'suite':
        return this.suiteByKey(suiteKey).devPorts.suite;
      case 'app':
        return this.appByKeys(suiteKey, appKey).devPorts.app;
      case 'api':
        return this.appByKeys(suiteKey, appKey).devPorts.api;
      default:
        return null;
    }
  },

  titleByRoleAndKeys(role, suiteKey, appKey) {
    const suite = this.suiteByKey(suiteKey);
    const app = this.appByKeys(suiteKey, appKey);

    switch (role) {
      case 'suite':
        return `${suite.name} Suite`;
      case 'app':
        return `${suite.name} - ${app.name} App`;
      case 'api':
        return `${suite.tenantKey} ${suite.name} API - ${app.name} (${app.key})`;
      default:
        return null;
    }
  },

  descriptionByRoleAndKeys(role, suiteKey, appKey) {
    const suite = this.suiteByKey(suiteKey);
    const app = this.appByKeys(suiteKey, appKey);

    switch (role) {
      case 'suite':
        return `${suite.tenantKey} ${suite.longName}`;
      case 'app':
        return `${suite.name} ${app.longName}`;
      case 'api':
        return `Application Programming Interface (API) for ${app.longName}`;
      default:
        return null;
    }
  },

  azureProfileByKey: (suiteData, key) =>
    _(suiteData.azure)
      .filter({ key })
      .first()
};

// Assign optimized versions of some getters
getters.suiteByKey = _.memoize(getters._suiteByKeyRaw);
getters.appByKeys = _.memoize(getters._appByKeysRaw, memoizeKeyResolver);

const mutations = {
  /**
   * Add specified Suite object to array of Suites in JSON data file. Any errors are logged to the console
   * @param {object} suite Suite object with fields as specified in the solution admin schema (config.yml)
   * @returns True on success, false otherwise
   */
  addSuite(suite) {
    try {
      db.get('suites')
        .insert(suite) // TODO: consider upsert/update case when key already exists
        .write();

      return true;
    } catch (e) {
      let knownError = '';
      if (e.toString().includes('duplicate id')) knownError = `The Suite Key "${suite.key}" already exists.`;
      console.log(`\n* Oops! This Suite can't be added. ${knownError}`);
      if (!knownError) console.log(`[${e}]`);

      return false;
    }
  }
};

const context = {
  _fromRoleAndKeysRaw: (solutionRole, suiteKey, appKey) => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test',
    isTemplateDev: !!process.env.TDEV,
    isInfoOnly: !!process.env.INFO_ONLY,
    isVerbose: !!process.env.VERBOSE,
    solutionDataFilePath: getters.filePath,
    solutionRole,
    suiteKey,
    appKey,
    suiteData: getters.suiteByKey(suiteKey),
    appData: getters.appByKeys(suiteKey, appKey),
    sourcePath: getters.sourcePathByRoleAndKeys(solutionRole, suiteKey, appKey),
    buildDir: getters.buildDirByRoleAndKeys(solutionRole, suiteKey, appKey),
    port: process.env.TDEV ? getters.portByRoleAndKeys(solutionRole, suiteKey, appKey) : process.env.PORT || process.env.NUXT_PORT,
    title: getters.titleByRoleAndKeys(solutionRole, suiteKey, appKey),
    description: getters.descriptionByRoleAndKeys(solutionRole, suiteKey, appKey)
  }),
  fromRoleAndKeys: null
};

// Assign optimized context routine
context.fromRoleAndKeys = _.memoize(context._fromRoleAndKeysRaw, memoizeKeyResolver);

module.exports = {
  getters,
  mutations,
  context
};
