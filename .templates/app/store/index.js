// const app = require('@/app.config');
// const scenario = app.SCENARIO_KEY.toLowerCase();
import _ from 'lodash';

const vpCtx = process.env.vpCtx;
const suiteData = vpCtx.suiteData;
const appData = vpCtx.appData;

const shallowAppData = _(appData)
  .omit('applets')
  .value();

const applets = appData.applets;

const taxonomy = {
  suiteName: suiteData.name,
  suiteShortName: suiteData.key,
  suiteVersion: vpCtx.solutionVersion,
  appName: appData.name,
  appLongName: appData.longName,
  appShortName: appData.key
};

export const state = () => ({
  app: {
    data: shallowAppData,
    applets,
    modelKeys: [],
    modelPropKeys: {
      // Certain model properties must be referenced generically across various features/functions in an app, so we configure
      // them here to avoid hard-coding their keys
      // TODO: These keys should be common to all DB tables in an app. Support configuration in vpCtx and merging here
      primaryKey: 'ID',
      recycledFlag: 'Archived',
      defaultNonSearchable: ['FName']
    }
  },
  ui: {
    taxonomy,
    snackbar: {
      show: false,
      msg: '',
      mode: 'success' // one of 'success', 'error'
    },
    snackbarTimeout: 3000,
    pinnedItem: {
      keyValue: '', // *Not* the property key (aka column name) but the actual key *value*, typically a GUID or int surrogate key value
      title: '',
      model: {
        key: ''
      }
    }
  },
  stats: {
    needsAttnCount: {
      // TODO: Add values here of the form: "applet-key": /* count of items needing attention */
    }
  },
  models: {
    // Models are added here of the form: "model-key": {/* model object */}
  }
});

export const getters = {};

export const mutations = {
  showSnackbar(state, payload) {
    console.log('STORE: In Mutation "showSnackbar"');

    state.ui.snackbar = {
      show: true,
      ...payload
    };
  },

  hideSnackbar(state) {
    console.log('STORE: In Mutation "hideSnackbar"');

    state.ui.snackbar = {
      show: false,
      msg: '',
      mode: 'success'
    };
  },

  storeAllModelKeys(state, payload) {
    console.log('STORE: In Mutation "storeAllModelKeys"');

    state.app.modelKeys = payload;
  },

  storeModel(state, payload) {
    console.log(`STORE: In Mutation "storeModel" for "${payload.key}"`);

    state.models = { ...state.models, [payload.key]: payload.value };
  },

  // TODO: Add "clearPinnedItem" to wrap what it means to reset pinnedItem to default/empty
  // TODO: Change payload of "setPinnedItem" to accept pinnedItem key and model key individually
  setPinnedItem(state, payload) {
    console.log(`STORE: In Mutation "setPinnedItem" for "${payload.model.key}"`);

    _.merge(state.ui.pinnedItem, payload);
  }
};

// #region Mutation Helpers
// #endregion

export const actions = {
  async flashSnackbar({ getters, commit, state }, { msg, mode }) {
    console.log('STORE: In Action "flashSnackbar"');

    commit('showSnackbar', { msg, mode });
    setTimeout(() => commit('hideSnackbar'), state.ui.snackbarTimeout);
  },

  async loadModelByKey({ getters, commit, state }, { key }) {
    console.log(`STORE: In Action "loadModelByKey" for "${key}"...`);

    // Nothing to do if we already have the model with the specified key
    if (state.models[key]) {
      console.log(`STORE: ...nothing to do in "loadModelByKey" for "${key}"`);
      return;
    }

    try {
      let modelUrl = this.$model.urlFromKey(key);
      console.log('AXIOS: Getting Model', modelUrl);

      console.log('AXIOS: Got Model');
      const value = await this.$axios.$get(modelUrl);
      commit('storeModel', { key, value });

      console.log(`STORE: Stored model for "${key}"`);
    } catch (e) {
      console.log('STORE: Error getting or storing model:', e);
    }
  }
};
