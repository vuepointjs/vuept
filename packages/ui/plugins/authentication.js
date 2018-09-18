import Vue from 'vue';
import authentication from '@vuept/ui/authentication';
import _ from 'lodash';

const vpCtx = process.env.vpCtx;
const useFakeAuth = vpCtx.isTemplateDev;
const azureProfileKey = vpCtx.isNodeDev ? 'DEV' : 'PROD';
const azureData = _(vpCtx.suiteData.azure)
  .filter({ key: azureProfileKey })
  .first();

// console.log('In "authentication" plugin...');
// console.log(`vpCtx: ${JSON.stringify(vpCtx, null, 2)}`);
// console.log(`suiteData: ${JSON.stringify(suiteData, null, 2)}`);
// console.log(`azureData: ${JSON.stringify(azureData, null, 2)}`);

// Init authentication module
authentication.initialize(azureData, useFakeAuth, vpCtx.isVerbose).then(_ => {
  // Install "auth" as a Vue plugin
  const authenticationPlugin = {
    install() {
      Vue.auth = authentication;
      Vue.prototype.$auth = authentication;
    }
  };

  Vue.use(authenticationPlugin);

  console.log('PI: $auth installed');
});
