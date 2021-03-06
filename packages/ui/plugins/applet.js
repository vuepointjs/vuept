/**
 * applet.js: VP applet helper methods and data
 */
import Vue from 'vue';

// Nuxt plugin bootup - main entry point
export default (ctx, inject) => {
  // Install "$applet" as a Vue + Nuxt plugin (e.g., ctx.app.$applet, this.$applet in components and store)
  inject(
    'applet',
    new Vue({
      data: () => ({
        recycleBinViewKey: 'RB'
      }),

      created() {
        console.log('PI: $applet vue instance created');
      },

      methods: {
        /**
         * Given an applet key (case-insensitive) return the matching applet object, if any
         * @param {string} key Applet "key" (unique 2 character ID string)
         */
        fromKey(key) {
          let applet = ctx.store.state.app.applets.find(item => item.key.toUpperCase() === key.toUpperCase());
          return applet ? applet : {};
        },

        /**
         * Given the active route return the corresponding applet object for the route, if any
         * @param {object} route Route object for current, active route
         */
        fromRoute(route) {
          let key = route.params.applet;
          if (!key) return {};
          return this.fromKey(key);
        },

        /**
         * Given an applet object return the raw array of views defined for the applet, if any
         * @param {object} applet Applet object
         */
        rawViews(applet) {
          return (applet && applet.views) || [];
        },

        /**
         * Given an applet and a view key (case-insensitive) return the raw view definition object, if any
         * @param {object} applet Applet object
         * @param {string} key View key
         */
        rawViewFromKey(applet, key) {
          let rawViews = this.rawViews(applet);
          return (rawViews && rawViews.find(view => view.key.toUpperCase() === key.toUpperCase())) || {};
        },

        /**
         * Given an applet object return the array of views defined for the applet, if any, ready for rendering
         * @param {object} applet Applet object
         */
        views(applet) {
          let appletViews = applet && applet.views;
          return appletViews
            ? _(appletViews)
                .map(val => {
                  let inheritsFromVal = val.inheritsFrom && this.rawViewFromKey(applet, val.inheritsFrom);
                  return inheritsFromVal ? _.merge({}, inheritsFromVal, val) : val;
                })
                .sortBy('ord')
                .value()
            : [];
        },

        /**
         * Given an applet object and the type of a view, return the view definition object, if any
         * @param {object} applet Applet object
         * @param {string} type Type of view desired
         */
        viewByType(applet, type) {
          let appletView = this.views(applet).find(item => item.type.toUpperCase() === type.toUpperCase());
          return appletView ? appletView : {};
        },

        /**
         * Given an applet object and the name of a view, return the view definition object, if any
         * @param {object} applet Applet object
         * @param {string} name Name of the view
         */
        viewFromName(applet, name) {
          let appletView = this.views(applet).find(item => item.name.toUpperCase() === name.toUpperCase());
          return appletView ? appletView : {};
        },

        /**
         * Given an applet object, compose and return a default applet view based on the model properties (as a fallback to the applet configuration).
         * On error return an empty object
         * @param {object} applet Applet object
         */
        defaultView(applet) {
          let recycledPropKey = ctx.app.$model.recycledFlagPropertyKey;
          if (!applet || !recycledPropKey) return {};

          let view = {
            name: 'All Items',
            key: 'ALL',
            ord: 1,
            type: 'List',
            subType: 'Grid',
            filter: [{ propertyKey: recycledPropKey, operator: 'eq', value: 0 }],
            include: null,
            properties: []
          };

          // Get some info needed below to build the array of properties
          let sortKey = '';
          const model = this.model(applet);
          const modelProperties = ctx.app.$model.requiredProperties(model);
          const excludedProps = [ctx.app.$model.recycledFlagPropertyKey, ...ctx.store.state.app.modelPropKeys.defaultNonSearchable];
          const searchableModelPropKeys = ctx.app.$model.requiredStringPropertyKeys(model, excludedProps);

          _(modelProperties).forEach((val, index) => {
            let viewProp = {
              key: val.key,
              label: ctx.app.$helpers.toTitleCase(val.key)
            };
            if (!sortKey && val.required && val.type === 'string') {
              sortKey = val.key;
              viewProp.sort = 'ASC';
            }
            if (searchableModelPropKeys.includes(val.key)) viewProp.search = true;
            view.properties.push(viewProp);
          });

          return view;
        },

        /**
         * Given an applet object and parent/child flag, compose and return a pinned applet view (for the parent or the child) based on the All Items ('ALL') view
         * @param {object} applet Applet object
         * @param {boolean} forParent True if the pinned view is for a parent (primary model), false for a child that is dependent on (has FK ref to) a parent
         */
        pinnedView(applet, forParent) {
          let recycledPropKey = ctx.app.$model.recycledFlagPropertyKey;
          if (!applet || !recycledPropKey) return {};

          const primaryOrFkPropKey = forParent ? ctx.app.$model.primaryKeyPropertyKey : ctx.app.$model.firstRelationFK(this.model(applet));
          let rawPinnedViewDefinition = {
            name: 'Pinned',
            key: 'PINNED',
            ord: 1,
            inheritsFrom: 'ALL',
            filter: [
              { propertyKey: recycledPropKey, operator: 'eq', value: 0 },
              { propertyKey: primaryOrFkPropKey, operator: 'eq', value: ctx.store.state.ui.pinnedItem.keyValue }
            ]
          };

          return _.merge({}, this.rawViewFromKey(applet, 'ALL'), rawPinnedViewDefinition);
        },

        /**
         * Given an applet object and the array of view properties in one of the applet's views, return the array of properties marked searchable,
         * identified by property key. Note that we omit/ignore any properties marked searchable that are: (1) From relations included in the view, or (2) That are
         * not of type string
         * @param {object} applet Applet object
         * @param {array} props Applet view properties
         */
        searchableViewPropKeys(applet, props) {
          const model = this.model(applet);
          return model && props && props.length > 0
            ? _(props)
                .filter({ search: true })
                .map(val => val.key)
                .intersection(ctx.app.$model.stringPropertyKeys(model))
                .value()
            : [];
        },

        /**
         * Given the array of view properties (if any) in an applet view, return a sort spec object "{sortBy, descending}"
         * from the first property marked for sorting, or a default sort spec object on failure
         * @param {array} props Applet view properties
         * @param {string} defaultSortKey Property key for the fallback default view property to use for sortBy if no property is explicitly marked for sorting
         */
        viewSortSpecFromProps(props, defaultSortKey) {
          return props && props.length > 0
            ? _(props)
                .filter('sort')
                .map(val => ({ sortBy: val.key, descending: val.sort.toUpperCase() === 'DESC' }))
                .first()
            : { sortBy: defaultSortKey, descending: false };
        },

        /**
         * Given an applet view property return true if it is considered sortable, false otherwise
         * @param {object} prop Applet view property
         */
        viewPropIsSortable(prop) {
          return prop && prop.key && !prop.key.includes('.'); // For now, props are only non-sortable when they are in a sub-object (e.g., Customer.LName)
        },

        /**
         * Given an applet key (case-insensitive) return the base route for the applet
         * @param {string} key Applet "key" (unique 2 character ID string)
         */
        baseRouteFromKey(key) {
          return `/${key.toLowerCase()}`;
        },

        /**
         * Return true if the specified current, active route is a route involving the specified applet
         * @param {string} key Applet "key" (unique 2 character ID string)
         * @param {object} route Route object for current, active route
         */
        routeIsActive(key, route) {
          return route.path.toLowerCase().includes(this.baseRouteFromKey(key));
        },

        /**
         * Given an applet key (case-insensitive) return the corresponding Mousetrap keybinding
         * for navigating to the applet's home page
         * @param {string} key Applet "key" (unique 2 character ID string)
         */
        keybindingFromKey(key) {
          let combo = '';
          combo = key.toLowerCase();
          combo = combo.slice(0, 1) + ' ' + combo.slice(1, 2);
          return combo;
        },

        /**
         * Given the Mousetrap keybinding for an applet return the applet's key (ID) in uppercase.
         * When the actual, case-sensitive applet key value is required, this uppercase applet key must
         * be used to lookup the applet info in the Vuex store
         * @param {string} combo Mousetrap keyboard combination, in this case a 2 char sequence
         */
        keyFromKeybinding(combo) {
          let key = combo.replace(' ', '').toUpperCase();
          return key;
        },

        /**
         * Given an applet object return the corresponding (primary) model key, or falsy if no model key is associated with the applet
         * @param {object} applet Applet object
         */
        modelKey(applet) {
          return applet && applet.primaryModel;
        },

        /**
         * Given an applet object return the corresponding model object, or an empty object on failure
         * @param {object} applet Applet object
         */
        model(applet) {
          return (applet && ctx.app.$model.byKey(this.modelKey(applet))) || {};
        },

        /**
         * Given a model key return the corresponding applet object for which the model is configured as the primary model, if any
         * @param {string} modelKey Model key
         */
        fromModelKey(modelKey) {
          if (!modelKey) return {};

          let applet = ctx.store.state.app.applets.find(item => item.primaryModel === modelKey);
          return applet ? applet : {};
        },

        // TODO: consider if we need to keep this applet method
        // /**
        //  * Given an applet key (case-insensitive) return the corresponding API URL for getting the model, or an empty string on failure
        //  * @param {string} key Applet "key" (unique 2 character ID string)
        //  */
        // modelUrlFromKey(key) {
        //   const applet = this.fromKey(key);
        //   const modelKey = applet && applet.primaryModel;
        //   return modelKey ? ctx.app.$model.urlFromKey(modelKey) : '';
        // },

        /**
         * Given an applet object return the corresponding API URL for getting data
         * @param {object} applet Applet object
         */
        baseDataUrl(applet) {
          // e.g., https://zz.domain.com/api/v1/Customers
          let apiHost = ctx.app.$api.host;
          let apiPort = ctx.app.$api.port;
          let apiProtocol = 'http://';
          let basePath = ctx.app.$api.baseDataPath;

          if (['443', '80'].includes(apiPort)) {
            apiProtocol = apiPort === '443' ? 'https://' : 'http://';
            apiPort = ''; // no need to specify port in final URL in this case
          }

          let pluralModelName = ctx.app.$model.pluralName(this.model(applet));

          return `${apiProtocol}${apiHost}${apiPort ? `:${apiPort}` : ''}${basePath}/${pluralModelName}`;
        },

        /**
         * Given an applet object return the configured applet singular name, if any, or as a fallback the model singular name.
         * Return an empty string on failure
         * @param {object} applet Applet object
         */
        singularName(applet) {
          if (!applet) return '';
          return applet.singularName || ctx.app.$model.singularName(this.model(applet));
        },

        /**
         * Return the applet object for the currently pinned item, if any, or an empty object
         */
        fromPinnedItem() {
          return this.fromModelKey(ctx.store.state.ui.pinnedItem.model.key);
        }
      }
    })
  );

  console.log('PI: $applet installed');
};
