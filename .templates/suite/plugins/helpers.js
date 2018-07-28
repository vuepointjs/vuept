import Vue from 'vue';
import numeral from 'numeral';
import colors from 'vuetify/es5/util/colors';

/**
 * General helper methods and data for the app
 */
const helpers = {
  /**
   * Assuming "value" is not null or an empty string, return it formatted with thousands separators
   * and, if applicable, a single digit after the decimal point
   * @param {number} value
   */
  formatNumber(value) {
    return value === null ? '-' : value === '' ? '' : numeral(value).format('0,0[.]0');
  },

  /**
   * Given any non-negative integer index arg, return a color from lookup tables containing
   * assortments of light and dark colors. The color is returned as an RGB hex value string
   * @param {number} index
   */
  colorFromIndex(index) {
    // See: https://vuetifyjs.com/en/style/colors
    // NOTE: Dark and Light sub-tables *must* contain the same number of colors!
    let colorTable = [
      // Dark
      [
        colors.blue.darken4,
        colors.teal.darken4,
        colors.orange.darken3,
        colors.lime.darken4,
        colors.blueGrey.darken2,
        colors.deepPurple.darken4,
        colors.red.darken4,
        colors.lightBlue.darken4,
        colors.green.darken4,
        colors.yellow.darken4,
        colors.lightGreen.darken3,
        colors.brown.darken4,
        colors.grey.darken2,
        colors.deepOrange.darken4,
        colors.pink.darken4
      ],
      // Light
      [
        colors.blue.lighten1,
        colors.teal.lighten1,
        colors.orange.lighten1,
        colors.lime.lighten1,
        colors.blueGrey.lighten1,
        colors.deepPurple.lighten1,
        colors.red.lighten2,
        colors.lightBlue.lighten1,
        colors.green.base,
        colors.yellow.darken1,
        colors.pink.darken1,
        colors.brown.lighten1,
        colors.grey.lighten1,
        colors.deepOrange.lighten1,
        colors.lightGreen.lighten1
      ]
    ];

    return colorTable[index % 2][index % colorTable[0].length];
  },

  // #region Applet Helpers
  /**
   * Given an applet key (case-insensitive) and reference to the Vuex store, return the matching applet object, if any
   * @param {string} key Applet "key" (unique 2 character ID string)
   * @param {object} store Vuex store reference
   */
  appletFromKey(key, store) {
    let applet = store.state.ui.applets.find(item => item.key.toUpperCase() === key.toUpperCase());
    return applet ? applet : {};
  },

  /**
   * Given the active route and a reference to the Vuex store, return the corresponding applet object for the route, if any
   * @param {object} route Route object for current, active route
   * @param {object} store Vuex store reference
   */
  activeAppletFromRoute(route, store) {
    let key = route.params.applet;
    if (!key) return {};
    return this.appletFromKey(key, store);
  },

  /**
   * Given an applet object and a reference to the Vuex store, return the array of views defined for the applet, if any
   * @param {object} applet Applet object
   * @param {object} store Vuex store reference
   */
  appletViews(applet, store) {
    let appletViews = store.state.ui.appletViews.find(item => item.key.toUpperCase() === applet.key.toUpperCase());
    return appletViews ? appletViews.views : [];
  },

  /**
   * Given an applet object, the name of a view, and a reference to the Vuex store, return the view definition object, if any
   * @param {object} applet Applet object
   * @param {string} name Name of the view
   * @param {object} store Vuex store reference
   */
  appletViewFromName(applet, name, store) {
    let appletView = this.appletViews(applet, store).find(item => item.key === name);
    return appletView ? appletView : {};
  },

  /**
   * Given an applet key (case-insensitive), return the base route for the applet
   * @param {string} key Applet "key" (unique 2 character ID string)
   */
  appletBaseRouteFromKey(key) {
    return `/${key.toLowerCase()}`;
  },

  /**
   * Return true if the specified current, active route is a route involving the specified applet
   * @param {string} key Applet "key" (unique 2 character ID string)
   * @param {object} route Route object for current, active route
   */
  appletRouteActive(key, route) {
    return route.path.toLowerCase().includes(this.appletBaseRouteFromKey(key));
  },

  /**
   * Given an applet key (case-insensitive), return the corresponding Mousetrap keybinding
   * for navigating to thr applet's home page
   * @param {string} key Applet "key" (unique 2 character ID string)
   */
  appletKeybindingFromKey(key) {
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
  appletKeyFromKeybinding(combo) {
    let key = combo.replace(' ', '').toUpperCase();
    return key;
  },
  // #endregion

  regex: {
    htmlTagsAndSpaces: /&nbsp;|<\/?[\w\s="/.':;#-\/\?]+>/gi
  }
};

// Install "helpers" as a Vue plugin
const helpersPlugin = {
  install() {
    Vue.helpers = helpers;
    Vue.prototype.$helpers = helpers;
  }
};

Vue.use(helpersPlugin);
