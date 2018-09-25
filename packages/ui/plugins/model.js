/**
 * model.js: VP data model helpers
 */
import Vue from 'vue';

// Nuxt plugin bootup - main entry point
export default (ctx, inject) => {
  // Install "$model" as a Vue + Nuxt plugin (e.g., ctx.app.$model, this.$model in components and store)
  inject(
    'model',
    new Vue({
      data: () => ({}),

      created() {
        console.log('PI: $model vue instance created');
      },

      methods: {
        /**
         * Given a model name (singular, kebab-case) return the corresponding API URL for the model
         * @param {string} name Model name
         */
        urlFromName(name) {
          // e.g., https://zz.domain.com/api/static/dddddddd/models/party.json
          let apiHost = ctx.app.$helpers.apiHost;
          let apiPort = ctx.app.$helpers.apiPort;
          let apiProtocol = 'http://';
          let basePath = ctx.app.$helpers.baseApiModelPath;

          if (['443', '80'].includes(apiPort)) {
            apiProtocol = apiPort === '443' ? 'https://' : 'http://';
            apiPort = ''; // no need to specify port in final URL in this case
          }

          return `${apiProtocol}${apiHost}${apiPort ? `:${apiPort}` : ''}${basePath}/${name}.json`;
        },

        fromAppletKey(key) {},

        singularNameFromAppletKey(key) {},

        pluralNameFromAppletKey(key) {}
      },

      computed: {
        /**
         * Given a model name (singular, kebab-case) return the corresponding model (if any) from the store
         * @param {string} name Model name
         */
        byName(name) {
          return ctx.store.state.models[name];
        }
      }
    })
  );

  console.log('PI: $model installed');
};
