/**
 * api.js: REST API client-side helper methods and data for the app
 */
import Vue from 'vue';
import _ from 'lodash';

const vpCtx = process.env.vpCtx;
const azureProfileKey = vpCtx.isNodeDev ? 'DEV' : 'PROD';
const azureProfile = _(vpCtx.suiteData.azure)
  .filter({ key: azureProfileKey })
  .first();

// Nuxt plugin bootup - main entry point
export default (ctx, inject) => {
  // Install "$api" as a Vue + Nuxt plugin (e.g., ctx.app.$api, this.$api in components and store)
  inject(
    'api',
    new Vue({
      data: () => ({
        host: ctx.env.vpCtx.apiHost,
        port: ctx.env.vpCtx.apiPort,
        baseDataPath: '/api/v1',
        maxConcurrency: 7
      }),

      created() {
        console.log('PI: $api vue instance created');
        // console.log(`PI: $api apiHost = ${this.apiHost}, apiPort = ${this.apiPort}`);
        // console.log(`PI: $api baseApiModelPath = ${this.baseApiModelPath}`);
      },

      computed: {
        baseModelPath() {
          let azureApiIdPiece = azureProfile.apiId.split('-', 1);
          return `/api/static/${azureApiIdPiece ? azureApiIdPiece[0] : 'eeeeeeee'}/models`;
        }
      },

      methods: {}
    })
  );

  console.log('PI: $api installed');
};
