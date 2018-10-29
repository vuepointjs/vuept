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
        // LoopBack "REST syntax" query string methods...
        // ==============================================
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
          let primaryKeyOrderExpression = `filter[order]=${ctx.app.$model.primaryKeyPropertyKey}`;
          if (!sortBy) return primaryKeyOrderExpression; // Defensively respond to any problem with sortBy
          return `filter[order]=${sortBy}${descending ? '%20DESC' : '%20ASC'}&${primaryKeyOrderExpression}`;
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
         * Given an array of relation keys return the LoopBack query string fragment for including the related data during retrieval
         * @param {array} include Array of strings specifying the relations to include. These strings are the keys in a model's "relations" sub-object
         * @returns LoopBack query string fragment for including related data
         */
        dataIncludeQryStr(include) {
          let res = '';

          if (include && Array.isArray(include) && include.length > 0 && include[0]) {
            res = _.reduce(include, (accum, val) => `${accum}${accum ? '&' : ''}filter[include]=${val}`, '');
          }

          return res;
        },

        /**
         * Given an array of filter spec objects and a search spec object, return the LoopBack query string fragment for filtering/searching data during retrieval
         * @param {array} filter Array of objects of the form: { propertyKey: "", operator: "", value: any } used to build LoopBack [where] clause expressions to
         * include in resulting query string. Note that this routine only supports the equality operator ("eq") and ignores any object in the array having a different
         * operator
         * @param {object} [search={}] Optional object with search spec of the form: { keys: [], text: "" }, where keys are the property keys to search
         * for the given text. Note that this routine does NOT actually support more than one search key in the keys array due to a limitation in the
         * LoopBack "REST syntax" for filtering
         * @returns LoopBack query string fragment for filtering/searching a data endpoint
         */
        dataFilteringQryStr(filter, search) {
          let res = '';

          if (filter && Array.isArray(filter) && filter.length > 0 && filter[0]) {
            res = _.reduce(
              filter,
              (accum, val) => {
                if (val.operator && val.operator === 'eq') {
                  return `${accum}${accum ? '&' : ''}filter[where][${val.propertyKey}]=${val.value}`;
                }
                return accum;
              },
              ''
            );
          }

          // TODO: Strip unsafe characters from search before constructing qry str
          if (search && search.keys && search.keys.length > 0 && search.text) {
            res += _.reduce(search.keys, (accum, val) => `${accum}${res || accum ? '&' : ''}filter[where][${val}][like]=%25${search.text}%25`, '');
            // console.log(`PI: $api built qry str to search data in column(s) "${search.keys}"`);
          }

          return res;
        },

        /**
         * Given an array of filter spec objects and a search spec object, return the LoopBack query string fragment for filtering against a count endpoint
         * @param {array} filter Array of objects of the form: { propertyKey: "", operator: "", value: any } used to build LoopBack [where] clause expressions to
         * include in resulting query string. Note that this routine only supports the equality operator ("eq") and ignores any object in the array having a different
         * operator
         * @param {object} [search={}] Optional object with search spec of the form: { keys: [], text: "" }, where keys are the property keys to search
         * for the given text. Note that this routine does NOT actually support more than one search key in the keys array due to a limitation in the
         * LoopBack "REST syntax" for filtering
         * @returns LoopBack query string fragment for filtering a count endpoint
         */
        countFilteringQryStr(filter, search) {
          let res = '';
          let whereIndex = 0;

          if (filter && Array.isArray(filter) && filter.length > 0 && filter[0]) {
            res = _.reduce(
              filter,
              (accum, val) => {
                if (val.operator && val.operator === 'eq') {
                  return `${accum}${accum ? '&' : ''}[where][and][${whereIndex++}][${val.propertyKey}]=${val.value}`;
                }
                return accum;
              },
              ''
            );
          }

          // TODO: Strip unsafe characters from search before constructing qry str
          if (search && search.keys && search.keys.length > 0 && search.text) {
            res += _.reduce(search.keys, (accum, val) => `${accum}${res || accum ? '&' : ''}[where][and][${whereIndex++}][${val}][like]=%25${search.text}%25`, '');
          }

          // In case we ended up with a single "where" clause, remove the unnecessary "[and][0]"
          if (whereIndex === 1) res = res.replace('[and][0]', '');

          return res;
        },

        // LoopBack "Node syntax" query spec builder methods...
        // ====================================================
        // For building data retrieval/counting URLs that look something like this:
        //   http://localhost/api/Customers?filter={"limit":5,"skip":0,"order":["LName ASC","ID ASC"],
        //    "where":{"and":[{"Archived": 0},{"or":[{"LName":{"like":"%Smith%"}},{"Email":{"like":"%Smith%"}}]}]}}

        /**
         * Given the sortBy property key and the descending flag return the LoopBack query spec object for sorting data during retrieval
         * @param {string} sortBy Property key by which to sort
         * @param {boolean} descending True for descending order, false for ascending
         * @returns LoopBack query spec for sorting
         */
        dataSortingQrySpec(sortBy, descending) {
          let spec = { order: [] };
          if (sortBy) spec.order.push(`${sortBy} ${descending ? 'DESC' : 'ASC'}`);

          // It's actually a good idea to include ID (primary key) as the last sort order column to make the ordering predictable when, for example,
          // customers have the same last name
          spec.order.push(`${ctx.app.$model.primaryKeyPropertyKey} ASC`);

          return spec;
        },

        /**
         * Given the page number and number of rowsPerPage return the LoopBack query spec object for paging data during retrieval
         * @param {number} page Page number (1-based)
         * @param {number} rowsPerPage Number of rows per page
         * @returns LoopBack query spec for paging
         */
        dataPagingQrySpec(page, rowsPerPage) {
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

          return {
            limit: rowsPerPage,
            skip: (page - 1) * rowsPerPage
          };
        },

        /**
         * Given an array of relation keys return the LoopBack query spec object for including the related data during retrieval
         * @param {array} include Array of strings specifying the relations to include. These strings are the keys in a model's "relations" sub-object
         * @returns LoopBack query spec for including related data
         */
        dataIncludeQrySpec(include) {
          if (include && Array.isArray(include) && include.length > 0 && include[0]) return { include };
          return {};
        },

        /**
         * Given an array of filter spec objects and a search spec object, return the LoopBack query spec object for filtering/searching data during retrieval
         * @param {array} filter Array of objects of the form: { propertyKey: "", operator: "", value: any } used to build LoopBack "where" spec to include in
         * resulting query string
         * @param {object} [search={}] Optional object with search spec of the form: { keys: [], text: "" }, where keys are the property keys to search
         * for the given text
         * @returns LoopBack query spec for filtering/searching a data endpoint
         */
        dataFilteringQrySpec(filter, search) {
          let spec = { where: { and: [] } };

          if (filter && Array.isArray(filter) && filter.length > 0 && filter[0]) {
            _.forEach(filter, val => {
              if (val.operator && val.operator === 'eq') spec.where.and.push({ [val.propertyKey]: val.value });
              else spec.where.and.push({ [val.propertyKey]: { [val.operator]: val.value } });
            });
          }

          // TODO: Strip unsafe characters from search before constructing qry str
          if (search && search.keys && Array.isArray(search.keys) && search.keys.length > 0 && search.text) {
            let searchSpecs = [];
            _.forEach(search.keys, val => {
              if (val) searchSpecs.push({ [val]: { like: `\%25${search.text}\%25` } });
            });

            if (searchSpecs.length > 0) spec.where.and.push({ or: searchSpecs });
          }

          return spec;
        },

        /**
         * Given an array of filter spec objects and a search spec object, return the LoopBack query spec object for filtering against a count endpoint
         * @param {array} filter Array of objects of the form: { propertyKey: "", operator: "", value: any } used to build LoopBack "where" spec to include in
         * resulting query string
         * @param {object} [search={}] Optional object with search spec of the form: { keys: [], text: "" }, where keys are the property keys to search
         * for the given text
         * @returns LoopBack query spec for filtering a count endpoint
         */
        countFilteringQrySpec(filter, search) {
          // For /count endpoint we must not supply the "{where: ...}" wrapper object
          let spec = { and: [] };

          if (filter && Array.isArray(filter) && filter.length > 0 && filter[0]) {
            _.forEach(filter, val => {
              if (val.operator && val.operator === 'eq') spec.and.push({ [val.propertyKey]: val.value });
              else spec.and.push({ [val.propertyKey]: { [val.operator]: val.value } });
            });
          }

          // TODO: Strip unsafe characters from search before constructing qry str
          if (search && search.keys && Array.isArray(search.keys) && search.keys.length > 0 && search.text) {
            let searchSpecs = [];
            _.forEach(search.keys, val => {
              if (val) searchSpecs.push({ [val]: { like: `\%25${search.text}\%25` } });
            });

            if (searchSpecs.length > 0) spec.and.push({ or: searchSpecs });
          }

          return spec;
        }
      }
    })
  );

  console.log('PI: $api installed');
};
