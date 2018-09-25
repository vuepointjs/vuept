<template>
  <v-container fluid class="pa-0" v-show="dataLoaded">
    <v-layout>
      <v-flex>
        <h2>{{ $applet.fromRoute(this.$route).name }} - All Items</h2>

        <v-toolbar dense class="elevation-0 vp-items-toolbar" height="40">
          <v-text-field hide-details prepend-icon="search" class="vp-items-search-input" single-line v-model="search"></v-text-field>

          <!--
          <v-btn icon>
            <v-icon>my_location</v-icon>
          </v-btn>

          <v-btn icon>
            <v-icon>more_vert</v-icon>
          </v-btn>
          -->
        </v-toolbar>

        <v-data-table v-model="selected" :must-sort="mustSort" :headers="headers" :items="rows" :pagination.sync="pagination" :total-items="totalItems"
          rows-per-page-text="Rows:" :rows-per-page-items="rowsOptions">

          <template slot="items" slot-scope="row">
            <!-- Allow clicking anywhere on a row to select it for actions -->
            <tr :class="rowCssClasses(row)" :active="row.selected" @click="rowClick(row)">
              <!-- Render a cell for each property in the view -->
              <td v-for="(col, i) in viewProperties" :key="`col${i}`">
                <span>{{ row.item[col] }}</span>
              </td>
            </tr>
          </template>
        </v-data-table>

      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex';
import _ from 'lodash';

export default {
  props: {},

  data: () => ({
    rows: [],
    columns: [],
    headers: [],
    selected: [],
    search: '',
    totalItems: 0,
    rowsOptions: [5, 10, 25, 100, 500],
    pagination: {
      sortBy: 'LName',
      rowsPerPage: 10
    },
    mustSort: true
  }),

  async created() {
    console.log('COMP: Created /applet/list <items-as-grid>');
    await this.getMetadata();
  },

  mounted() {
    console.log('COMP: Mounted /applet/list <items-as-grid>');
  },

  beforeDestroy() {},

  destroyed() {
    console.log('COMP: Destroyed /applet/list <items-as-grid>');
  },

  watch: {
    pagination: {
      handler() {
        console.log('COMP: Pagination handler invoked');
        this.getData();
      },
      deep: true
    },

    search: {
      handler() {
        this.debounceSearch();
      }
    }
  },

  computed: {
    applet() {
      return this.$applet.fromRoute(this.$route);
    },

    modelKey() {
      return this.$applet.modelKey(this.applet);
    },

    model() {
      return this.$store.state.models[this.modelKey];
    },

    modelPluralName() {
      return this.$model.pluralName(this.model);
    },

    // The subset of model properties to display in this view.
    // TODO: Default to the properties marked required, but look at view spec
    modelProperties() {
      return this.$model.requiredProperties(this.model);
    },

    // True when the data has been loaded via API, false otherwise
    dataLoaded() {
      return true;
      // return this.$store.state...rows.length > 0;
    }
  },

  methods: {
    async getMetadata() {
      try {
        console.log('COMP: Getting metadata...');

        // Fail without a model key
        if (!this.modelKey) return false;

        await this.loadModelByKey({ key: this.modelKey });

        // Fail without a model
        if (!this.model) return false;

        // this.columns = this.$store.state.ZzzData.columns;
        this.headers = [];
        this.rows = [];

        this.getHeaders();
        // this.rows = this.$store.state.Data.rows;
      } catch (e) {
        this.headers = [];
        this.rows = [];
        console.log('COMP: Error getting metadata:', e);
        return false;
      }

      return true;
    },

    getData() {
      try {
        console.log('COMP: Getting data...');

        // Nothing to do without a model
        if (!this.model) {
          console.log('COMP: Failed getting data. No model');
          return false;
        }

        const { sortBy, descending, page, rowsPerPage } = this.pagination;
        console.log(`COMP: Pagination params >>> sortBy: ${sortBy}, descending: ${descending}, page: ${page}, rowsPerPage: ${rowsPerPage}`);

        console.log(`COMP: ...Base Data URL: ${this.$applet.baseDataUrl(this.applet)}`);
        // await this.loadDataByZzz();

        // http://localhost:3000/api/Customers?filter[where][LName][like]=%25Ab%25&filter[order]=LName&filter[order]=ID&filter[limit]=5&filter[skip]=0
        // NOTE: It's actually a good idea to include ID as last sort order column to make the ordering predictable when, for example, customers have the same last name
        const dataSortQryStr = `filter[order]=${sortBy}${descending ? '%20DESC' : '%20ASC'}&filter[order]=ID`;
        const dataLimitQryStr = `filter[limit]=${rowsPerPage}&filter[skip]=${(page - 1) * rowsPerPage}`;
        const dataSortLimitQryStr = `${dataSortQryStr}&${dataLimitQryStr}`;

        let dataSearchQryStr = 'filter[where][Archived]=0&';
        let countSearchQryStr = '?[where][Archived]=0';
        if (this.search) {
          dataSearchQryStr = `filter[where][Archived]=0&filter[where][LName][like]=%25${this.search}%25&`;
          countSearchQryStr = `?[where][and][0][Archived]=0&[where][and][1][LName][like]=%25${this.search}%25`;
        }

        const dataUrl = `${this.dataBaseUrl}?${dataSearchQryStr}${dataSortLimitQryStr}`;
        const countUrl = `${this.countBaseUrl}${countSearchQryStr}`;

        console.log(`COMP: Getting ${this.modelPluralName}...`);
        axios.get(dataUrl).then(response => {
          // Kind of a hack to set these here... but at the moment we don't get the token and roles until
          // an API is called and the Axios handler kicks-in
          this.userRoles = authentication.userRoles;
          this.userApiToken = authentication.apiToken;

          console.log(`Got ${this.modelPluralName}`);
          this.rows = response.data;
          axios.get(countUrl).then(response => {
            this.totalItems = response.data.count;
            console.log(`${this.modelPluralName} count`, this.totalItems);
            // this.loading = false;
          });
        });

        console.log('COMP: Got data');
      } catch (e) {
        console.log('COMP: Error getting data:', e);
        return false;
      }

      return true;
    },

    debounceSearch: _.debounce(function() {
      console.log('Search input changed >>>', this.search);
      this.getData();
      this.pagination.page = 1;
    }, 500),

    getHeaders() {
      console.log(`COMP: model properties: ${this.$helpers.stringifyObj(this.modelProperties)}`);

      let renderedCols = [];

      this.headers = [];
      // this.headers.push({ text: 'Last Name', value: 'LName', align: 'left' });

      // renderedCols = this.columns...
    },

    rowCssClasses(row) {
      return {
        // 'class-name': condition,
        // 'class-name-2': condition-2
      };
    },

    rowClick(row) {
      let rowKey = row.item.key;
      row.selected = !row.selected;
    },

    ...mapActions(['loadModelByKey'])
  }
};
</script>

<style scoped>
/*
.vp-items-toolbar,
.vp-items-toolbar .v-toolbar__content {
}
*/

.vp-items-search-input {
  padding-top: 4px;
  max-width: 300px;
  min-width: 150px;
}
</style>
