<template>
  <v-container fluid class="pa-0">
    <v-layout>
      <v-flex>
        <h2>{{ applet.name }}</h2>

        <v-toolbar dense class="pr-1 elevation-0 vp-items-toolbar" height="36" color="grey lighten-3">
          <v-btn icon @click="focusRef('searchInput')">
            <v-tooltip bottom>
              <v-icon color="primary" slot="activator">search</v-icon>
              <span>Search</span>
            </v-tooltip>
          </v-btn>

          <v-text-field single-line hide-details clearable class="vp-items-search-input" v-model="search" label="Search"
            ref="searchInput"></v-text-field>

          <v-btn icon @click="flashSnackbar({ msg: 'New item feature coming soon!' })">
            <v-tooltip bottom>
              <v-icon color="primary" slot="activator">add</v-icon>
              <span>New</span>
            </v-tooltip>
          </v-btn>

          <v-btn icon :disabled="selected.length < 1" @click="flashSnackbar({ msg: 'Edit item feature coming soon!' })"
            ref="editItemBtn">
            <v-tooltip bottom>
              <v-icon color="primary" slot="activator">edit</v-icon>
              <span>Edit</span>
            </v-tooltip>
          </v-btn>

          <v-btn icon :disabled="selected.length < 1" @click="onDelete(selected[0])">
            <v-tooltip bottom>
              <v-icon color="primary" slot="activator">delete</v-icon>
              <span>Delete</span>
            </v-tooltip>
          </v-btn>

          <v-spacer></v-spacer>

          <v-menu left offset-y open-on-hover :nudge-width="100" transition="slide-y-transition" v-model="viewsMenu">
            <v-toolbar-title slot="activator">
              <v-hover close-delay="0">
                <div slot-scope="{ hover }" :class="hover ? 'grey lighten-2': ''" style="border-radius: 20px; padding: 0 5px">
                  <v-icon color="primary">notes</v-icon>
                  <span class="subheading font-weight-light pl-2 pr-1">{{ appletView.name }}</span>
                  <v-icon color="primary">keyboard_arrow_down</v-icon>
                </div>
              </v-hover>
            </v-toolbar-title>
            <v-list>
              <v-list-tile v-for="view, index in appletViews" :key="view.key" @click="selectedViewIndex = index" v-show="index != selectedViewIndex">
                <v-list-tile-title v-text="view.name"></v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
        </v-toolbar>

        <v-data-table disable-initial-sort class="vp-items-table" v-model="selected" :loading="loading" :must-sort="mustSort" :items="rows"
          :item-key="rowKey" :headers="columns" :pagination.sync="pagination" :total-items="totalItems"
          rows-per-page-text="Rows:" :rows-per-page-items="rowsOptions">

          <template slot="items" slot-scope="row">
            <!-- Allow clicking anywhere on a row to select it for actions -->
            <tr :active="row.selected" @click="rowClick(row)" @dblclick="rowDblClick(row)">
              <!-- First render the row selection indicator cell -->
              <td class="vp-items-selection-cell">
                <v-icon class="vp-items-selection-icon" color="primary" v-show="row.selected">check_circle</v-icon>
              </td>
              <!-- Then render a cell for each property in the view -->
              <td v-for="(col, i) in appletView.properties" :key="`col-${col.key}`">
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
import Vue from 'vue';
import { mapActions } from 'vuex';
import _ from 'lodash';

export default {
  props: {},

  data: () => ({
    loading: true,
    rows: [],
    rowKey: 'ID',
    columns: [],
    selected: [],
    search: '',
    totalItems: 0,
    rowsOptions: [5, 10, 25, 100, 500],
    pagination: {
      sortBy: 'ID',
      rowsPerPage: 10
    },
    mustSort: true,
    viewsMenu: false,
    selectedViewIndex: 0,
    inRowDblClick: false
  }),

  async created() {
    console.log('COMP: Created /applet/list <items-as-grid>');
    await this.getColumns();
  },

  mounted() {
    this.mountKeybindings();
    console.log('COMP: Mounted /applet/list <items-as-grid>');
  },

  beforeDestroy() {
    this.unmountKeybindings();
  },

  destroyed() {
    console.log('COMP: Destroyed /applet/list <items-as-grid>');
  },

  watch: {
    pagination: {
      handler() {
        this.debouncePagination();
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

    // All available applet views
    appletViews() {
      let views = this.$applet.views(this.applet);
      return views.length > 0 ? views : [this.defaultAppletView];
    },

    // The selected applet view
    appletView() {
      return this.appletViews[this.selectedViewIndex] || {};
    },

    appletViewSearchKeys() {
      return this.$applet.searchableViewPropKeys(this.appletView.properties);
    },

    appletViewSortSpec() {
      return this.$applet.viewSortSpecFromProps(this.appletView.properties);
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

    // The subset of model properties to display in this view
    // TODO: Default to the properties marked required (excluding the internal "Archived" prop), but look at view spec if it exists
    modelProperties() {
      let exclude = ['Archived'];
      return this.$model.requiredProperties(this.model, exclude);
    },

    // The model properties considered searchable, identified by key
    searchableModelPropKeys() {
      let exclude = ['Archived', 'FName'];
      return this.$model.requiredStringPropertyKeys(this.model, exclude);
    },

    // Compose a default applet view from model properties as a fallback
    defaultAppletView() {
      let view = {
        name: 'All Items',
        key: 'ALL',
        filterExpression: null,
        includeExpression: null,
        properties: []
      };

      let sortKey = '';
      _(this.modelProperties).forEach((val, index) => {
        let viewProp = { key: val.key, label: this.$helpers.toTitleCase(val.key) };
        if (!sortKey && val.required && val.type === 'string') {
          sortKey = val.key;
          viewProp.sort = 'ASC';
        }
        if (this.searchableModelPropKeys.includes(val.key)) viewProp.search = true;
        view.properties.push(viewProp);
      });

      return view;
    }
  },

  methods: {
    mountKeybindings() {
      let vm = this;

      // TODO: Rename plugin from "$mousetrap" to "$keyboard" or wrap mousetrap
      // in $keyboard plugin, install and use bindGlobal extension
      this.$mousetrap.bind('ctrl+alt+s', (evt, combo) => {
        console.log(`KBD: "${combo}" triggered`);
        // TODO: We *must* handle global menu state (SuiteBar AppletNavPanel, UserMenu, etc.)
        // when dealing with kbd shortcuts like this... for example, user clicks waffle menu or
        // presses shift+enter and then presses ctrl+alt+s to search, and we must *close* the
        // AppletNavPanel and set focus to the search box!

        vm.focusRef('searchInput');
      });
    },

    unmountKeybindings() {
      this.$mousetrap.unbind(['ctrl+alt+s']);
    },

    focusRef(refStr, useSubElt = false) {
      try {
        useSubElt = !!useSubElt;
        let elt = this.$refs[refStr];
        if (useSubElt) elt = elt.$el;
        elt.focus();
      } catch (e) {
        console.log('COMP: Error setting focus', e);
      }
    },

    async getRows() {
      try {
        console.log('COMP: Getting data rows...');

        this.loading = true;

        // Nothing to do without a model
        if (!this.model) {
          console.log('COMP: Failed getting data. No model');
          return false;
        }

        const { sortBy, descending, page, rowsPerPage } = this.pagination;
        console.log(`COMP: Pagination params >>> sortBy: ${sortBy}, descending: ${descending}, page: ${page}, rowsPerPage: ${rowsPerPage}`);

        console.log(`COMP: ...Base Data URL: ${this.$applet.baseDataUrl(this.applet)}`);
        // http://localhost/api/Customers?filter[where][LName][like]=%25Ab%25&filter[order]=LName&filter[order]=ID&filter[limit]=5&filter[skip]=0
        // NOTE: It's actually a good idea to include ID as last sort order column to make the ordering predictable when, for example, customers have the same last name
        const dataSortQryStr = `filter[order]=${sortBy}${descending ? '%20DESC' : '%20ASC'}&filter[order]=ID`;
        const dataLimitQryStr = `filter[limit]=${rowsPerPage}&filter[skip]=${(page - 1) * rowsPerPage}`;
        const dataSortLimitQryStr = `${dataSortQryStr}&${dataLimitQryStr}`;

        // TODO: Determine method for handling "Archived" piece of qry strings
        let dataSearchQryStr = 'filter[where][Archived]=0&';
        let countSearchQryStr = '?[where][Archived]=0';
        let searchColKey = this.appletViewSearchKeys[0];

        if (this.search) {
          console.log(`COMP: Searching in column "${searchColKey}"`);
          dataSearchQryStr = `filter[where][Archived]=0&filter[where][${searchColKey}][like]=%25${this.search}%25&`;
          countSearchQryStr = `?[where][and][0][Archived]=0&[where][and][1][${searchColKey}][like]=%25${this.search}%25`;
        }

        const baseDataUrl = this.$applet.baseDataUrl(this.applet);
        const baseCountUrl = `${baseDataUrl}/count`;
        const includeQryStr = (this.appletView.includeExpression && `&${this.appletView.includeExpression}`) || '';
        const dataUrl = `${baseDataUrl}?${dataSearchQryStr}${dataSortLimitQryStr}${includeQryStr}`;
        const countUrl = `${baseCountUrl}${countSearchQryStr}`;

        console.log(`AXIOS: Getting ${this.modelPluralName}...`);
        let dataResponse = await this.$axios.get(dataUrl);

        console.log(`AXIOS: Got ${this.modelPluralName}`);
        this.rows = dataResponse.data;

        console.log(`AXIOS: Getting ${this.modelPluralName} count...`);
        let countResponse = await this.$axios.get(countUrl);

        this.totalItems = countResponse.data.count;
        console.log(`AXIOS: Got ${this.modelPluralName} count`, this.totalItems);
        this.loading = false;
      } catch (e) {
        console.log('COMP: Error getting data:', e);
        return false;
      }

      return true;
    },

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
        this.columns.push({ text: '', value: 'rowSelectionIndicator', align: 'left', sortable: false });

        _(this.appletView.properties).forEach(val => {
          this.columns.push({ text: val.label || val.key, value: val.key, align: 'left', sortable: this.$applet.viewPropIsSortable(val) });
        });

        // Must set default sort column and order
        _.assign(this.pagination, this.appletViewSortSpec);
      } catch (e) {
        this.columns = [];
        console.log('COMP: Error getting metadata:', e);
        return false;
      }

      console.log('COMP: Got columns metadata');
      return true;
    },

    rowClick(row) {
      _.delay(
        (row, vm) => {
          console.log('COMP: Clicked on an item');
          if (vm.inRowDblClick) {
            console.log('COMP: ...item single-click skipped while double-click in progress');
            return;
          }

          // let rowKey = row.item.key;
          if (!row.selected) vm.selected.splice(0); // Remove all elements... we only allow single selection (for now)
          row.selected = !row.selected;
        },
        150,
        row,
        this
      );
    },

    rowDblClick(row) {
      let vm = this;
      try {
        this.inRowDblClick = true;
        console.log('COMP: Double-clicked on an item');

        // Ensure that "in-row-double-click" flag will soon be cleared
        setTimeout(_ => {
          vm.inRowDblClick = false;
          console.log('COMP: >>> Cleared "in double-click" flag');
        }, 500);

        // Handle various conditions, such as dbl-click on an item when another item is already selected
        if (!row.selected) this.selected.splice(0); // Remove all elements... we only allow single selection (for now)
        row.selected = true; // Select the row, or if the row was already selected don't allow any initial single-click to de-select it

        // Give Vue a chance to update the enabled state of the Edit button we're about to click on the toolbar...
        Vue.nextTick(_ => {
          let btn = vm.$refs.editItemBtn.$el;
          btn.focus();
          btn.click();
        });
      } catch (e) {
        console.log('COMP: Error handling double-click on item', e);
        this.inRowDblClick = false;
      }
    },

    debouncePagination: _.debounce(async function() {
      console.log('COMP: Pagination handler invoked');
      await this.getRows();
    }, 100),

    debounceSearch: _.debounce(async function() {
      console.log('COMP: Search input changed >>>', this.search);
      await this.getRows();
      this.pagination.page = 1;
    }, 500),

    async onDelete(row) {
      try {
        const patchUrl = this.$applet.baseDataUrl(this.applet);
        let patchObj = { User: this.$auth.userName, Archived: 1 };
        patchObj[this.rowKey] = row[this.rowKey];

        console.log(`AXIOS: Patching ${this.modelPluralName}...`);
        let patchResponse = await this.$axios.patch(patchUrl, patchObj);
        console.log(`AXIOS: ${this.modelPluralName} patch successful`);

        this.flashSnackbar({ msg: `Deleted item from ${this.modelPluralName}` });

        this.getRows();
      } catch (e) {
        console.log(`AXIOS: ${this.modelPluralName} patch error`, e);

        this.flashSnackbar({ msg: `Error deleting item from ${this.modelPluralName}`, mode: 'error' });
      }
    },

    ...mapActions(['loadModelByKey', 'flashSnackbar'])
  }
};
</script>

<style scoped>
/* Search input is hidden at first */
.vp-items-search-input {
  margin-top: -14px;
  min-width: 0;
  max-width: 0;
}

/* Search input expands when focused and stays expanded while "dirty" (has content) */
.vp-items-search-input.v-input--is-focused,
.vp-items-search-input.v-input--is-dirty {
  min-width: 150px;
  max-width: 180px;
}

/* The icon in the first column of the grid, displayed when an item is selected */
.vp-items-selection-icon {
  font-size: 22px;
  float: left;
  margin: 0 -18px 0 9px;
}
</style>

<style>
/* Table header */
.vp-items-table table.v-table thead tr {
  height: 42px;
}

/* Table rows */
.vp-items-table table.v-table tbody td,
.vp-items-table table.v-table tbody th {
  height: 40px;
}

/* First column (for item selection indicator) in table header and body */
.vp-items-table table.v-table thead th:first-child,
.vp-items-table table.v-table tbody td:first-child {
  padding: 0;
  width: 22px;
}
</style>
