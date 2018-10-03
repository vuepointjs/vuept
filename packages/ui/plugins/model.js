/**
 * model.js: VP data model helpers
 *
 * Models are typically identified by a "key" string that is the singular, kebab-case name of the model.
 * The LoopBack model json file is named with this key, and the Vuex store also indexes the map of models using this key
 */
import Vue from 'vue';
import _ from 'lodash';

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

        /**
         * Given a model key return the corresponding model (if any) from the store
         * @param {string} key Model key
         */
        byKey(key) {
          return ctx.store.state.models[key];
        },

        /**
         * Given a model object return the singular form of the model name
         * @param {*} model Model object
         */
        singularName(model) {
          return model ? model.name : '';
        },

        /**
         * Given a model object return the plural form of the model name
         * @param {*} model Model object
         */
        pluralName(model) {
          return model ? model.plural || `${model.name}s` : '';
        },

        /**
         * Given a model object return an array of the model's properties which are marked as required, or an empty array on failure
         * @param {object} model Model object
         * @param {array} [exclude=[]] Optional array of keys to explicitly exclude from the result
         */
        requiredProperties(model, exclude = []) {
          return model
            ? _(model.properties)
                .map((val, key) => ({ key, ...val }))
                .filter(val => !!val.required && !exclude.includes(val.key))
                .value()
            : [];
        },

        /**
         * Given a model object return an array of the model's property keys for properties of type "string" which are marked as required, or an empty array on failure
         * @param {object} model Model object
         * @param {array} [exclude=[]] Optional array of keys to explicitly exclude from the result
         */
        requiredStringPropertyKeys(model, exclude = []) {
          const allRequiredProps = this.requiredProperties(model, exclude);
          return allRequiredProps
            ? _(allRequiredProps)
                .filter(val => val.type && val.type === 'string')
                .map(val => val.key)
                .value()
            : [];
        },

        /**
         * Given a model object return an array of the model's properties which are considered user-editable, or an empty array on failure
         * @param {object} model Model object
         * @param {array} [exclude=[]] Optional array of keys to explicitly exclude from the result
         */
        editableProperties(model, exclude = []) {
          // We support several layers of default non-editable props configuration
          const appDefaultNonEditableProperties = ctx.store.state.app.data.nonEditableModelProperties;
          if (appDefaultNonEditableProperties && appDefaultNonEditableProperties.length > 0) exclude = _.union(appDefaultNonEditableProperties, exclude);

          return model
            ? _(model.properties)
                .map((val, key) => ({
                  key,
                  ...val
                }))
                .filter(
                  val =>
                    !val.id &&
                    !(val.mssql && val.mssql.dataType && val.mssql.dataType === 'uniqueidentifier') &&
                    !(model.hidden && model.hidden.includes(val.key)) &&
                    !exclude.includes(val.key)
                )
                .value()
            : [];
        }
      }
    })
  );

  console.log('PI: $model installed');
};
