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
      data: () => ({}),

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
         * Given an applet object return the array of views defined for the applet, if any
         * @param {object} applet Applet object
         */
        views(applet) {
          let appletViews = ctx.store.state.app.applets.views;
          return appletViews ? appletViews.views : [];
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
          let apiHost = ctx.app.$helpers.apiHost;
          let apiPort = ctx.app.$helpers.apiPort;
          let apiProtocol = 'http://';
          let basePath = ctx.app.$helpers.baseApiDataPath;

          if (['443', '80'].includes(apiPort)) {
            apiProtocol = apiPort === '443' ? 'https://' : 'http://';
            apiPort = ''; // no need to specify port in final URL in this case
          }

          let pluralModelName = ctx.app.$model.pluralName(ctx.app.$model.byKey(this.modelKey(applet)));

          return `${apiProtocol}${apiHost}${apiPort ? `:${apiPort}` : ''}${basePath}/${pluralModelName}`;
        }
      }
    })
  );

  console.log('PI: $applet installed');
};
