/**
 * model.js: VP data model helpers
 *
 * Models are typically identified by a "key" string that is the singular, kebab-case name of the model.
 * The LoopBack model json file is named with this key, and the Vuex store also indexes the map of models using this key
 */
import Vue from 'vue';
import _ from 'lodash';
import PQueue from 'p-queue';

const REST_CALLS_CONCURRENCY = 7;

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
         * Given a model key return the corresponding model (if any) from the Vuex store
         * @param {string} key Model key
         */
        byKey(key) {
          return ctx.store.state.models[key];
        },

        /**
         * Return an array of all distinct primary model keys across all applets in this app, or an empty array on error or if no model keys were found
         */
        allKeysInApp() {
          if (ctx.store.state.app.modelKeys.length > 0) return ctx.store.state.app.modelKeys;

          let modelKeys = [];
          let applets = ctx.store.state.app.applets;

          _(applets).forEach(applet => {
            let modelKey = applet.primaryModel;
            if (modelKey) modelKeys.push(modelKey);
          });
          let uniqModelKeys = _.uniq(modelKeys);

          ctx.store.commit('storeAllModelKeys', uniqModelKeys);
          return uniqModelKeys;
        },

        // TODO: Consider if this method should be implemented or deleted
        // /**
        //  * Call a provided callback function for each distinct model key specified in an applet view
        //  *
        //  * @param {function} cb
        //  */
        // forEachWithAppletView(cb) {},

        /** Load all models configured for this app */
        loadAll() {
          console.log('PI: $model "loadAll"');
          console.time('AXIOS: Getting all app models...');
          const queue = new PQueue({ concurrency: REST_CALLS_CONCURRENCY });

          _(this.allKeysInApp()).forEach(key => {
            queue.add(() => ctx.store.dispatch('loadModelByKey', { key }));
          });

          queue.onEmpty().then(() => {
            console.timeEnd('AXIOS: Getting all app models...');
            return;
          });
        },

        /**
         * Given a model key return true if an instance of the model (an "item") is currently pinned in the Vuex store, false otherwise
         * @param {string} key Model key
         */
        itemIsPinned(key) {
          let pinnedItem = ctx.store.state.ui.pinnedItem;
          return pinnedItem.key && typeof key != 'undefined' && key && pinnedItem.model.key === key;
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
         * Given a model singular name return the corresponding model key, or undefined if not found or error
         * @param {string} key Model key
         */
        keyFromSingularName(singularName) {
          return singularName ? _(ctx.store.state.models).findKey(val => val.name === singularName) : undefined;
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
        },

        /**
         * Given a model object return an instance object with all of the properties set to null or their default, or an empty object on failure
         * @param {object} model Model object
         * @param {array} [exclude=[]] Optional array of keys to explicitly exclude from the result
         */
        newInstance(model, exclude = []) {
          let props = model.properties; // Raw properties object... not "normalized" yet w/ "key" as its own key
          if (!props || props.length < 1) return {};

          let instance = {};
          let propVal = null;
          _(props).forEach((val, key) => {
            if (exclude.includes(key)) propVal = undefined;
            else {
              if (typeof val.default != 'undefined') propVal = val.default;
              else propVal = null;
            }

            instance[key] = propVal;
          });

          return instance;
        },

        /**
         * Given an individual model property, return the user-friendly label string to use in a detail view, for example
         * @param {object} prop Model property
         */
        propertyLabel(prop) {
          if (prop) {
            if (prop.description && prop.description.length <= 50) {
              let desc = prop.description;
              desc = desc.replace('True if ', '');
              return desc;
            } else return ctx.app.$helpers.toTitleCase(prop.key);
          }
          return '<Property Not Found>';
        },

        /**
         * Given an array of model properties, return an object containing property validators per the Vuetify validator spec. The returned object
         * is of the form: { propertyKey: [array of validator functions], ... }
         * See: https: //vuetifyjs.com/en/components/text-fields#example-validation
         * @param {array} props Model properties array
         */
        propertyValidators(props) {
          if (!props || props.length < 1) return {};

          let validate = {};
          _(props).forEach(val => {
            let propLabel = this.propertyLabel(val);
            let validators = [];

            if (val.required) validators.push(v => !!v || `${propLabel} is required`);

            if (val.type === 'string' && val.mssql && val.mssql.dataLength) {
              let maxLength = val.mssql.dataLength;
              validators.push(v => typeof v === 'undefined' || !v || v.length <= maxLength || `${propLabel} must be ${maxLength} characters or less`);
            }

            if (validators.length > 0) validate[val.key] = validators;
          });

          return validate;
        },

        /**
         * Given a model object and an individual model property, return true if the property is of type "categorical code", false otherwise
         * @param {object} model Model object
         * @param {object} prop Model property to be tested
         */
        propertyIsCategoricalCode(model, prop) {
          if (!model || !prop) return false;
          if (!prop.key) return false;
          if (!prop.key.endsWith('Cd')) return false;
          if (!prop.mssql) return false;
          if (!prop.mssql.dataType === 'nchar') return false;

          if (!(model._vp && model._vp.validations && model._vp.validations.oneOf)) return false;
          if (!model._vp.validations.oneOf[prop.key]) return false;

          return true;
        },

        /**
         * Given a model object return the name of the first related model for which a foreign key is defined, or an empty string if N/A or error
         * @param {*} model Model object
         */
        firstRelationName(model) {
          return (model && model._vp && model._vp.foreignKeys && model._vp.foreignKeys[Object.keys(model._vp.foreignKeys)[0]].referencesTable) || '';
        },

        /**
         * Given a model object return the foreign key property key of the first related model, or an empty string if N/A or error
         * @param {*} model Model object
         */
        firstRelationFK(model) {
          return (model && model._vp && model._vp.foreignKeys && Object.keys(model._vp.foreignKeys)[0]) || '';
        }
      }
    })
  );

  console.log('PI: $model installed');

  // Load all models (async)
  ctx.app.$model.loadAll();
};
