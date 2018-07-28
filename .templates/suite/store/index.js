const app = require('@/app.config');
const scenario = app.SCENARIO_KEY.toLowerCase();
const taxonomy = require(`./ui.taxonomy.${scenario}.base`);
const applets = require(`./ui.applets.${scenario}.base`);
const appletViews = require(`./ui.applet-views.${scenario}.base`);

export const state = () => ({
  ui: {
    taxonomy,
    applets,
    appletViews
  }
});

export const getters = {};

export const mutations = {};

// #region Mutation Helpers
// #endregion

export const actions = {};
