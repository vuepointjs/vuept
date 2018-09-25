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
    await this.getTabularData();
  },

  mounted() {
    console.log('COMP: Mounted /applet/list <items-as-grid>');
  },

  beforeDestroy() {},

  destroyed() {
    console.log('COMP: Destroyed /applet/list <items-as-grid>');
  },

  computed: {
    applet() {
      return this.$applet.fromRoute(this.$route);
    },

    modelKey() {
      return this.$applet.modelKeyFromKey(this.applet.key);
    },

    model() {
      return this.$store.state.models[this.modelKey];
    },

    // True when the data has been loaded via API, false otherwise
    dataLoaded() {
      return true;
      // return this.$store.state...rows.length > 0;
    }
  },

  methods: {
    async getTabularData() {
      try {
        console.log('COMP: Getting tabular data...');

        if (this.modelKey) {
          await this.loadModelByKey({ key: this.modelKey });
        }

        // await this.loadDataByZzz();
        console.log('COMP: Got tabular data');

        // this.columns = this.$store.state.ZzzData.columns;
        this.headers = [];
        this.rows = [];
        this.measureKeys = [];
        // this.getHeadersAndKeysFromRawData();
        // this.rows = this.$store.state.Data.rows;
      } catch (e) {
        this.headers = [];
        this.rows = [];
        console.log('COMP: Error getting rows and columns:', e);
      }
    },

    getHeadersAndKeysFromRawData() {
      let renderedCols = [];

      this.headers = [];
      this.measureKeys = [];
      this.headers.push({ text: '', value: 'Column Label', align: 'left', sortable: false });

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
