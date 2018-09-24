/**
 * helpers.js: General helper methods and data for the app
 */
import Vue from 'vue';
import _ from 'lodash';
import numeral from 'numeral';
import colors from 'vuetify/es5/util/colors';

const vpCtx = process.env.vpCtx;
const azureProfileKey = vpCtx.isNodeDev ? 'DEV' : 'PROD';
const azureProfile = _(vpCtx.suiteData.azure)
  .filter({ key: azureProfileKey })
  .first();

// Nuxt plugin bootup - main entry point
export default (ctx, inject) => {
  // Install "$helpers" as a Vue + Nuxt plugin (e.g., ctx.app.$helpers, this.$helpers in components and store)
  inject(
    'helpers',
    new Vue({
      data: () => ({
        regex: {
          htmlTagsAndSpaces: /&nbsp;|<\/?[\w\s="/.':;#-\/\?]+>/gi
        },
        azureProfile,
        apiHost: ctx.env.vpCtx.apiHost,
        apiPort: ctx.env.vpCtx.apiPort,
        baseApiDataPath: '/api/v1'
      }),

      created() {
        console.log('PI: $helpers vue instance created');
        // console.log(`PI: $helpers apiHost = ${this.apiHost}, apiPort = ${this.apiPort}`);
        // console.log(`PI: $helpers baseApiModelPath = ${this.baseApiModelPath}`);
      },

      methods: {
        stringifyObj(obj) {
          return JSON.stringify(obj, null, 2);
        },

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
        }
      },

      computed: {
        baseApiModelPath() {
          let azureApiIdPiece = azureProfile.apiId.split('-', 1);
          return `/api/static/${azureApiIdPiece ? azureApiIdPiece[0] : 'eeeeeeee'}/models`;
        }
      }
    })
  );

  console.log('PI: $helpers installed');
};
