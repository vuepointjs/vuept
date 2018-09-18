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

      methods: {
        /**
         * Given an applet key (case-insensitive) and reference to the Vuex store, return the matching applet object, if any
         * @param {string} key Applet "key" (unique 2 character ID string)
         * @param {object} store Vuex store reference
         */
        fromKey(key, store) {
          let applet = store.state.ui.applets.find(item => item.key.toUpperCase() === key.toUpperCase());
          return applet ? applet : {};
        },

        /**
         * Given the active route and a reference to the Vuex store, return the corresponding applet object for the route, if any
         * @param {object} route Route object for current, active route
         * @param {object} store Vuex store reference
         */
        fromRoute(route, store) {
          let key = route.params.applet;
          if (!key) return {};
          return this.fromKey(key, store);
        },

        /**
         * Given an applet object and a reference to the Vuex store, return the array of views defined for the applet, if any
         * @param {object} applet Applet object
         * @param {object} store Vuex store reference
         */
        views(applet, store) {
          let appletViews = store.state.ui.appletViews.find(item => item.key.toUpperCase() === applet.key.toUpperCase());
          return appletViews ? appletViews.views : [];
        },

        /**
         * Given an applet object, the name of a view, and a reference to the Vuex store, return the view definition object, if any
         * @param {object} applet Applet object
         * @param {string} name Name of the view
         * @param {object} store Vuex store reference
         */
        viewFromName(applet, name, store) {
          let appletView = this.views(applet, store).find(item => item.key === name);
          return appletView ? appletView : {};
        },

        /**
         * Given an applet key (case-insensitive), return the base route for the applet
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
         * Given an applet key (case-insensitive), return the corresponding Mousetrap keybinding
         * for navigating to thr applet's home page
         * @param {string} key Applet "key" (unique 2 character ID string)
         */
        keybindingFromKey(key) {
          let combo = '';
          combo = key.toLowerCase();
          combo = combo.slice(0, 1) + ' ' + combo.slice(1, 2);
          return combo;
        },

        /**
         * Given the Mousetrap keybinding for an applet, return the applet's key (ID) in uppercase.
         * When the actual, case-sensitive applet key value is required, this uppercase applet key must
         * be used to lookup the applet info in the Vuex store
         * @param {string} combo Mousetrap keyboard combination, in this case a 2 char sequence
         */
        keyFromKeybinding(combo) {
          let key = combo.replace(' ', '').toUpperCase();
          return key;
        }
      }
    })
  );

  console.log('PI: $applet installed');
};
