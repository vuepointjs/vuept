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
    applets
  },
  ui: {
    taxonomy,
    snackbar: {
      show: false,
      msg: '',
      mode: 'success' // one of 'success', 'error'
    },
    snackbarTimeout: 3000
  },
  models: {} // Models are added here of the form: "model-kebab-case-name": {/* model spec */}
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

  storeModel(state, payload) {
    console.log(`STORE: In Mutation "storeModel" for "${payload.name}"`);

    state.models = { ...state.models, [payload.name]: payload.value };
  }
};

// #region Mutation Helpers
// #endregion

export const actions = {
  async flashSnackbar({ getters, commit, state }, { msg, mode }) {
    console.log('STORE: In Action "flashSnackbar"');

    commit('showSnackbar', { msg, mode });
    setTimeout(_ => commit('hideSnackbar'), state.ui.snackbarTimeout);
  },

  async loadModelByName({ getters, commit, state }, { name }) {
    console.log(`STORE: In Action "loadModelByName" for "${name}"...`);

    // Nothing to do if we already have the model with the specified name
    if (state.models[name]) {
      console.log(`STORE: ...nothing to do in "loadModelByName" for "${name}"`);
      return;
    }

    try {
      let modelUrl = this.$model.urlFromName(name);
      console.log(`STORE: ...Model URL: ${modelUrl}`);

      const response = await this.$axios.$get(modelUrl);
      commit('storeModel', { name, value: response });

      console.log(`STORE: Got and stored model for "${name}"`);
    } catch (e) {
      console.log('STORE: Error getting model:', e);
    }
  }
};
