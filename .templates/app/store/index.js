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
    appletViews
  }
});

export const getters = {};

export const mutations = {};

// #region Mutation Helpers
// #endregion

export const actions = {};
