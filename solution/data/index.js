const path = require('path');
const dataPath = path.resolve(__dirname, './tenants/suites.json');
const lodashId = require('lodash-id');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(dataPath);
const db = low(adapter);

// Add lowdb methods for insert, upsert, etc. and set id field to 'key'. See: https://github.com/typicode/lodash-id
db._.mixin(lodashId);
db._.id = 'key';

const getters = {
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
      .value()
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

module.exports = {
  getters,
  mutations
};
