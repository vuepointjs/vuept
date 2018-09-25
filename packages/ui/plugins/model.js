/**
 * model.js: VP data model helpers
 *
 * Models are typically identified by a "key" string that is the singular, kebab-case name of the model.
 * The LoopBack model json file is named with this key, and the Vuex store also indexes the map of models using this key
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
         * Given a model key return the corresponding API URL for the model
         * @param {string} key Model key
         */
        urlFromKey(key) {
          // e.g., https://zz.domain.com/api/static/dddddddd/models/customer.json
          let apiHost = ctx.app.$helpers.apiHost;
          let apiPort = ctx.app.$helpers.apiPort;
          let apiProtocol = 'http://';
          let basePath = ctx.app.$helpers.baseApiModelPath;

          if (['443', '80'].includes(apiPort)) {
            apiProtocol = apiPort === '443' ? 'https://' : 'http://';
            apiPort = ''; // no need to specify port in final URL in this case
          }

          return `${apiProtocol}${apiHost}${apiPort ? `:${apiPort}` : ''}${basePath}/${key}.json`;
        },

        fromAppletKey(appletKey) {},

        singularNameFromAppletKey(appletKey) {},

        pluralNameFromAppletKey(appletKey) {}
      },

      computed: {
        /**
         * Given a model key return the corresponding model (if any) from the store
         * @param {string} key Model key
         */
        byKey(key) {
          return ctx.store.state.models[key];
        }
      }
    })
  );

  console.log('PI: $model installed');
};
