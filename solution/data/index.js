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

const getters = {
  filePath,

  allSuites: () => db.get('suites').value(),

  allSuiteKeys: () =>
    db
      .get('suites')
      .map('key')
      .value(),

  suiteByKey: key =>
    db
      .get('suites')
      .filter({ key })
      .first()
      .value(),

  suitePathByKey: key => path.resolve(__dirname, key === '__suite-key__' ? '../../.templates/suite/' : `../suite/${key.toLowerCase()}/`),

  appByKey: (suiteData, key) =>
    key
      ? _(suiteData.apps)
          .filter({ key })
          .first()
      : {},

  appByKeys: function(suiteKey, appKey) {
    return appKey && suiteKey
      ? _(this.suiteByKey(suiteKey).apps)
          .filter({ key: appKey })
          .first()
      : {};
  },

  appPathByKey: key => path.resolve(__dirname, key === '__app-key__' ? '../../.templates/app/' : `../app/${key.toLowerCase()}/`),

  appPathByRoleAndKey: function(role, key) {
    return role === 'suite' ? this.suitePathByKey(key) : this.appPathByKey(key);
  },

  sourcePathByRoleAndKeys: function(role, suiteKey, appKey) {
    switch (role) {
      case 'suite':
        return this.suitePathByKey(suiteKey);
      case 'app':
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
        return appKey === '__app-key__' ? `.nuxt-tdev-${role}` : `.nuxt-${suiteKey.toLowerCase()}-${appKey.toLowerCase()}`;
      default:
        return null;
    }
  },

  portByRoleAndKeys: function(role, suiteKey, appKey) {
    switch (role) {
      case 'suite':
        return this.suiteByKey(suiteKey).devPorts.suite;
      case 'app':
        return this.appByKeys(suiteKey, appKey).devPorts.app;
      default:
        return null;
    }
  },

  titleByRoleAndKeys: function(role, suiteKey, appKey) {
    switch (role) {
      case 'suite':
        return `${this.suiteByKey(suiteKey).name} Suite`;
      case 'app':
        return `${this.suiteByKey(suiteKey).name} - ${this.appByKeys(suiteKey, appKey).name} App`;
      default:
        return null;
    }
  },

  azureProfileByKey: (suiteData, key) =>
    _(suiteData.azure)
      .filter({ key })
      .first()
};

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
  fromRoleAndKeys: (solutionRole, suiteKey, appKey) => ({
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
    title: getters.titleByRoleAndKeys(solutionRole, suiteKey, appKey)
  })
};

module.exports = {
  getters,
  mutations,
  context
};
