import Vue from 'vue';
import authentication from '@vuept/ui/authentication';
import _ from 'lodash';

const vpCtx = process.env.vpCtx;
const isNodeDev = vpCtx.isNodeDev;
const isTemplateDev = vpCtx.isTemplateDev;

// console.log('In "authentication" plugin...');
// console.log(`vpCtx: ${JSON.stringify(vpCtx, null, 2)}`);

if (isTemplateDev) {
  console.log('Loading "authentication" plugin... skipping auth for template development');
} else {
  const suiteData = vpCtx.suiteData;
  // console.log(`In "authentication" plugin suiteData is ${JSON.stringify(suiteData, null, 2)}`);

  const azureProfileKey = vpCtx.isNodeDev ? 'DEV' : 'PROD';
  const azureData = _(suiteData.azure)
    .filter({ key: azureProfileKey })
    .first();

  // console.log(`In "authentication" plugin azureData is ${JSON.stringify(azureData)}`);

  // Init authentication module
  authentication.initialize(azureData).then(_ => {
    // Install "authentication" as a Vue plugin
    const authenticationPlugin = {
      install() {
        Vue.authentication = authentication;
        Vue.prototype.$authentication = authentication;
      }
    };

    Vue.use(authenticationPlugin);
  });
}
