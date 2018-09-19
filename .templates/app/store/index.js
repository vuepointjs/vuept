// const app = require('@/app.config');
// const scenario = app.SCENARIO_KEY.toLowerCase();

const vpCtx = process.env.vpCtx;
const suiteData = vpCtx.suiteData;
const appData = vpCtx.appData;

// const taxonomy = require(`./ui.taxonomy.${scenario}.base`);
const taxonomy = {
  suiteName: suiteData.name,
  suiteShortName: suiteData.key,
  suiteVersion: vpCtx.solutionVersion,
  appName: appData.name,
  appLongName: appData.longName,
  appShortName: appData.key
};

// const applets = require(`./ui.applets.${scenario}.base`);
const applets = appData.applets;

const appletViews = []; // require(`./ui.applet-views.${scenario}.base`);

export const state = () => ({
  ui: {
    taxonomy,
    applets,
    appletViews,
    snackbar: {
      show: false,
      msg: '',
      mode: 'success' // one of 'success', 'error'
    },
    snackbarTimeout: 3000
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
  }
};

// #region Mutation Helpers
// #endregion

export const actions = {
  async flashSnackbar({ getters, commit, state }, { msg, mode }) {
    console.log('STORE: In Action "flashSnackbar"');

    commit('showSnackbar', { msg, mode });
    setTimeout(_ => commit('hideSnackbar'), state.ui.snackbarTimeout);
  }
};
