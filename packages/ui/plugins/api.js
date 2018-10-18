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

      methods: {
        // LoopBack query string methods...
        // For building data-retrieval URLs that look something like this:
        //   http://localhost/api/Customers?filter[where][LName][like]=%25Ab%25&filter[order]=LName&filter[order]=ID&filter[limit]=5&filter[skip]=0
        // ...and data-counting URLs that look something like this:
        //   http://localhost/api/Customers/count?[where][and][0][Archived]=0&[where][and][1][LName][like]=%25Smith%25

        /**
         * Given the sortBy property key and the descending flag return the LoopBack query string fragment for sorting data during retrieval
         * @param {string} sortBy Property key by which to sort
         * @param {boolean} descending True for descending order, false for ascending
         * @returns LoopBack query string fragment for sorting
         */
        dataSortingQryStr(sortBy, descending) {
          // It's actually a good idea to include ID (primary key) as the last sort order column to make the ordering predictable when, for example,
          // customers have the same last name
          let primaryKeyFilterExpression = `filter[order]=${ctx.app.$model.primaryKeyPropertyKey}`;
          if (!sortBy) return primaryKeyFilterExpression; // Defensively respond to any problem with sortBy
          return `filter[order]=${sortBy}${descending ? '%20DESC' : '%20ASC'}&${primaryKeyFilterExpression}`;
        },

        /**
         * Given the page number and number of rowsPerPage return the LoopBack query string fragment for paging data during retrieval
         * @param {number} page Page number (1-based)
         * @param {number} rowsPerPage Number of rows per page
         * @returns LoopBack query string fragment for paging
         */
        dataPagingQryStr(page, rowsPerPage) {
          // Defensively correct any problems with args
          if (!Number.isInteger(page)) {
            console.error('PI: $api "dataPagingQryStr" bad arg: "page"');
            page = 1;
          }
          if (!Number.isInteger(rowsPerPage)) {
            console.error('PI: $api "dataPagingQryStr" bad arg: "rowsPerPage"');
            rowsPerPage = 5;
          }
          if (page < 1) page = 1;
          if (rowsPerPage < 1) rowsPerPage = 5;
          if (rowsPerPage > 500) rowsPerPage = 500;

          return `filter[limit]=${rowsPerPage}&filter[skip]=${(page - 1) * rowsPerPage}`;
        },

        /**
         * Given an array of filterExpressions and a search spec object, return the LoopBack query string fragment for filtering/searching data during retrieval
         * @param {array} filterExpressions Array of LoopBack [where] clause expressions to include in resulting query string
         * @param {object} [search={}] Optional object with search spec of the form: { keys: [], text: "" }, where keys are the property keys to search for the given text
         * @returns LoopBack query string fragment for filtering/searching
         */
        dataFilteringQryStr(filterExpressions, search) {
          if (!filterExpressions || !Array.isArray(filterExpressions) || filterExpressions.length < 1 || !filterExpressions[0]) return '';

          // TODO: map/reduce array of filterExpressions to multiple 'filter[where]...' clauses
          let res = `filter[where]${filterExpressions[0]}`;

          // TODO: Strip unsafe characters from search before constructing qry str
          if (search && search.keys && search.keys.length > 0 && search.text) {
            let searchColKey = search.keys[0];
            res = `filter[where]${filterExpressions[0]}&filter[where][${searchColKey}][like]=%25${search.text}%25`;
            console.log(`PI: $api built qry str to search in column "${searchColKey}"`);
          }

          return res;
        }
      }
    })
  );

  console.log('PI: $api installed');
};
