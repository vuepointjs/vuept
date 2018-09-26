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

        <v-data-table v-model="selected" :loading="loading" :must-sort="mustSort" :items="rows" :headers="columns"
          :pagination.sync="pagination" :total-items="totalItems" rows-per-page-text="Rows:" :rows-per-page-items="rowsOptions">

          <template slot="items" slot-scope="row">
            <!-- Allow clicking anywhere on a row to select it for actions -->
            <tr :class="rowCssClasses(row)" :active="row.selected" @click="rowClick(row)">
              <!-- Render a cell for each property in the view -->
              <td v-for="(col, i) in modelProperties" :key="`col${col.key}`">
                <span>{{ row.item[col.key] }}</span>
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
    loading: true,
    rows: [],
    columns: [],
    selected: [],
    search: '',
    totalItems: 0,
    rowsOptions: [5, 10, 25, 100, 500],
    pagination: {
      sortBy: 'X',
      rowsPerPage: 10
    },
    mustSort: true
  }),

  async created() {
    console.log('COMP: Created /applet/list <items-as-grid>');
    await this.getColumns();
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
        this.getRows();
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
    // TODO: Default to the properties marked required (excluding the internal "Archived" prop), but look at view spec if it exists
    modelProperties() {
      let exclude = ['Archived'];
      return this.$model.requiredProperties(this.model, exclude);
    },

    // True when the data has been loaded via API, false otherwise
    dataLoaded() {
      return true;
      // return this.$store.state...rows.length > 0;
    }
  },

  methods: {
    getRows() {
      try {
        console.log('COMP: Getting data rows...');

        // this.rows = [];
        this.loading = true;

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

        const baseDataUrl = this.$applet.baseDataUrl(this.applet);
        const baseCountUrl = `${baseDataUrl}/count`;
        const dataUrl = `${baseDataUrl}?${dataSearchQryStr}${dataSortLimitQryStr}`;
        const countUrl = `${baseCountUrl}${countSearchQryStr}`;

        console.log(`COMP: Getting ${this.modelPluralName}...`);
        this.$axios.get(dataUrl).then(response => {
          console.log(`Got ${this.modelPluralName}`);
          this.rows = response.data;
          this.$axios.get(countUrl).then(response => {
            this.totalItems = response.data.count;
            console.log(`${this.modelPluralName} count`, this.totalItems);
            this.loading = false;
          });
        });

        console.log('COMP: Got data');
      } catch (e) {
        console.log('COMP: Error getting data:', e);
        // this.rows = [];
        return false;
      }

      return true;
    },

    debounceSearch: _.debounce(function() {
      console.log('Search input changed >>>', this.search);
      this.getRows();
      this.pagination.page = 1;
    }, 500),

    async getColumns() {
      try {
        console.log('COMP: Getting columns metadata...');

        // Fail without a model key
        if (!this.modelKey) return false;

        await this.loadModelByKey({ key: this.modelKey });

        // Fail without a model
        if (!this.model) return false;

        // console.log(`COMP: model properties: ${this.$helpers.stringifyObj(this.modelProperties)}`);
        this.columns = [];

        _(this.modelProperties).forEach(val => {
          this.columns.push({ text: this.$helpers.toTitleCase(val.key), value: val.key, align: 'left' });
        });

        // Must set default sort column
        this.pagination.sortBy = this.columns && this.columns[0].value;
      } catch (e) {
        this.columns = [];
        console.log('COMP: Error getting metadata:', e);
        return false;
      }

      console.log('COMP: Got metadata');
      return true;
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
