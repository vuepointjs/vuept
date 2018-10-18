<template>
  <v-container fluid class="pa-0">
    <v-layout class="vp-items-as-grid">
      <v-flex>
        <v-toolbar dense class="pr-2 elevation-0 vp-items-toolbar" :class="{'vp-items-toolbar-extra-dense': $vuetify.breakpoint.xs }"
          :height="itemsToolbarHeight" color="grey lighten-3">
          <v-btn icon class="vp-items-search-btn" @click="toggleSearchInput">
            <v-tooltip bottom>
              <v-icon color="primary" slot="activator">search</v-icon>
              <span>Search</span>
            </v-tooltip>
          </v-btn>

          <v-text-field :class="['vp-items-search-input', {'vp-items-search-input-open': searchInputOpen}]" single-line
            hide-details clearable v-model="search" label="Search" ref="searchInput"></v-text-field>

          <template v-if="appletView.key != $applet.recycleBinViewKey">
            <!--
              Consider using this version once we have a working "pinning" implementation with foreign keys, etc.
              <v-btn icon @click="onNew" :disabled="!applet.hasPinnableModel && !pinnedItem.key">
            -->
            <v-btn icon @click="onNew">
              <v-tooltip bottom>
                <v-icon color="primary" slot="activator">add</v-icon>
                <span>New</span>
              </v-tooltip>
            </v-btn>

            <v-btn icon :disabled="selected.length < 1" @click="onEdit(selected[0])" ref="editItemBtn">
              <v-tooltip bottom>
                <v-icon color="primary" slot="activator">edit</v-icon>
                <span>Edit</span>
              </v-tooltip>
            </v-btn>

            <v-btn icon :disabled="selected.length < 1" @click="onDelete(selected[0])">
              <v-tooltip bottom>
                <v-icon color="primary" slot="activator">delete</v-icon>
                <span>Recycle</span>
              </v-tooltip>
            </v-btn>

            <v-btn v-show="hasPinnableModel" icon :disabled="selected.length < 1 && !hasPinnedItem" @click="onTogglePin(selected[0])"
              :class="{'grey lighten-2': hasPinnedItem }">
              <v-tooltip bottom>
                <v-icon color="secondary" slot="activator">person_pin_circle</v-icon>
                <span>{{ hasPinnedItem ? 'Unpin' : 'Pin' }}</span>
              </v-tooltip>
            </v-btn>
          </template>

          <v-spacer></v-spacer>

          <v-menu left offset-y class="vp-items-views-menu" :nudge-width="100" :nudge-bottom="5" transition="slide-y-transition"
            v-model="viewsMenu" :disabled="hasPinnedItem || hasParentWithPinnedItem">
            <v-toolbar-title slot="activator">
              <v-hover close-delay="0">
                <div slot-scope="{ hover }" class="vp-items-views-menu-hover" :class="hover ? 'grey lighten-2': ''">
                  <v-icon color="primary" :disabled="hasPinnedItem || hasParentWithPinnedItem">notes</v-icon>
                  <span class="subheading font-weight-light pl-2 pr-1" :class="{'text--disabled': hasPinnedItem || hasParentWithPinnedItem}">
                    {{ appletView.name }}
                  </span>
                  <v-icon color="primary" :disabled="hasPinnedItem || hasParentWithPinnedItem">keyboard_arrow_down</v-icon>
                </div>
              </v-hover>
            </v-toolbar-title>
            <v-list>
              <v-list-tile v-for="view, index in appletViews" :key="view.key" @click="selectedView.index = index"
                v-show="index != selectedView.index">
                <v-list-tile-title v-text="view.name"></v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
        </v-toolbar>

        <v-data-table disable-initial-sort class="vp-items-table" v-model="selected" :loading="loading" :must-sort="mustSort"
          :items="rows" :item-key="$model.primaryKeyPropertyKey" :headers="columns" :pagination.sync="pagination"
          :total-items="totalItems" rows-per-page-text="Rows:" :rows-per-page-items="rowsOptions">

          <template slot="items" slot-scope="row">
            <!-- Allow clicking anywhere on a row to select it for actions -->
            <tr :active="row.selected" @click="rowClick(row)" @dblclick="rowDblClick(row)">
              <!-- First render the row selection indicator cell -->
              <td class="vp-items-selection-cell">
                <v-icon class="vp-items-selection-icon" color="primary" v-show="row.selected">check_circle</v-icon>
              </td>
              <!-- Then render a cell for each property in the view -->
              <td v-for="(col, i) in appletView.properties" :key="`col-${col.key}`">
                <span>{{ cellValue(row, col) }}</span>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>

    <v-layout row justify-center class="vp-items-as-grid-detail">
      <v-dialog persistent no-click-animation scrollable v-model="detail.dialog" class="vp-items-detail-dialog">
        <v-card class="vp-items-detail-dialog-wrapper" :width="$vuetify.breakpoint.xs ? $vuetify.breakpoint.width : maxDetailDialogWidth"
          :height="$vuetify.breakpoint.height - (itemsToolbarHeight + 5)">
          <v-card-title>
            <v-btn small flat round color="primary" @click.native="onSave">
              <v-icon left color="primary">save</v-icon>
              <span class="text-capitalize subheading">Save</span>
            </v-btn>
            <v-btn small flat round color="primary" @click.native="detail.dialog = false">
              <v-icon left color="primary">clear</v-icon>
              <span class="text-capitalize subheading">Cancel</span>
            </v-btn>
          </v-card-title>
          <v-divider></v-divider>

          <v-card-text class="vp-items-detail-dialog-body pb-3" ref="detailDialogBody">
            <v-form v-model="detail.isValid" ref="detailDialogForm" lazy-validation>
              <template v-for="prop in editableModelProps">
                <template v-if="prop.type === 'boolean'">
                  <v-switch color="primary" :label="$model.propertyLabel(prop)" v-model="detail.values[prop.key]"></v-switch>
                </template>
                <template v-else>
                  <v-text-field :label="$model.propertyLabel(prop)" v-model="detail.values[prop.key]" :type="textInputType(prop)"
                    :mask="textInputMask(prop)" :rules="detail.validate[prop.key] || []"></v-text-field>
                </template>
                <div class="pb-1"></div>
              </template>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-container>
</template>

<script>
import Vue from 'vue';
import { mapActions, mapMutations } from 'vuex';
import _ from 'lodash';

export default {
  props: {},

  data: () => ({
    itemsToolbarHeight: 46,
    maxDetailDialogWidth: 500,
    loading: true,
    rows: [],
    columns: [],
    selected: [],
    search: '',
    searchInputOpen: false,
    totalItems: 0,
    rowsOptions: [5, 10, 25, 100, 500],
    pagination: {
      sortBy: '',
      rowsPerPage: 10
    },
    mustSort: true,
    viewsMenu: false,
    selectedView: {
      index: 0
    },

    inRowDblClick: false,
    inViewChange: false,

    detail: {
      dialog: false,
      mode: 'Add', // one of 'Add', 'Edit'
      values: {},
      validate: {},
      isValid: false
    }
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
      async handler() {
        if (!this.inViewChange) await this.debouncePagination();
      },
      deep: true
    },

    async search() {
      if (!this.inViewChange) await this.debounceSearch();
    },

    selectedView: {
      async handler() {
        await this.debounceViewChange();
      },
      deep: true
    },

    pinnedItem: {
      handler() {
        console.log('COMP: Pinned item change handler... resetting selected view index');
        this.selectedView = { index: 0 };
      },
      deep: true
    },

    inRowDblClick(newVal) {
      console.log(`COMP: >>> *${newVal ? 'Set' : 'Cleared'}* "in row double-click" flag`);
    },
    inViewChange(newVal) {
      console.log(`COMP: >>> *${newVal ? 'Set' : 'Cleared'}* "in view change" flag`);
    },

    'detail.dialog': function(val) {
      if (val) {
        // this.$nextTick(() => {
        //   this.$refs.FirstInput.focus();
        // });
      } else {
        this.$nextTick(() => {
          this.$refs.detailDialogForm.reset();
          _.assign(this.detail.values, this.$model.newInstance(this.model));
        });
      }
    }
  },

  computed: {
    // Default rows-per-page decreases with shorter screen height
    defaultRowsPerPage() {
      return this.$vuetify.breakpoint.height < 800 ? 5 : 10;
    },

    applet() {
      return this.$applet.fromRoute(this.$route);
    },
    // All available views for this applet, depending on pinned state
    appletViews() {
      let views = [];
      if (this.hasPinnedItem || this.hasParentWithPinnedItem) {
        views = [this.$applet.pinnedView(this.applet, this.hasPinnedItem)];
      } else {
        views = this.$applet.views(this.applet);
        views = views.length > 0 ? views : [this.$applet.defaultView(this.applet)];
      }
      return views;
    },
    // The selected applet view
    appletView() {
      return this.appletViews[this.selectedView.index] || {};
    },
    appletViewSearchKeys() {
      return this.$applet.searchableViewPropKeys(this.appletView.properties);
    },
    appletViewSortSpec() {
      return this.$applet.viewSortSpecFromProps(this.appletView.properties, this.$model.primaryKeyPropertyKey);
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
    // The subset of model properties considered editable in the details view
    editableModelProps() {
      return this.$model.editableProperties(this.model);
    },

    hasPinnableModel() {
      return !!this.applet.hasPinnableModel;
    },
    hasPinnedItem() {
      return this.$model.itemIsPinned(this.modelKey);
    },
    hasParent() {
      return this.$model.hasParent(this.modelKey);
    },
    hasParentWithPinnedItem() {
      return this.$model.parentItemIsPinned(this.modelKey);
    },

    pinnedItem() {
      return this.$store.state.ui.pinnedItem;
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

        vm.toggleSearchInput();
      });
    },

    unmountKeybindings() {
      this.$mousetrap.unbind(['ctrl+alt+s']);
    },

    toggleSearchInput() {
      this.searchInputOpen = !this.searchInputOpen;

      if (!this.searchInputOpen) {
        this.search = '';
      } else {
        this.focusRef('searchInput');
      }
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

        const dataSortingQryStr = this.$api.dataSortingQryStr(sortBy, descending);
        const dataPagingQryStr = this.$api.dataPagingQryStr(page, rowsPerPage);
        const dataSortingAndPagingQryStr = `${dataSortingQryStr}&${dataPagingQryStr}`;

        // TODO: If typeof filterExpression === 'array' then map to multiple 'filter[where]...' clauses
        let filterExpression = this.appletView.filterExpression;
        let dataSearchQryStr = `filter[where]${filterExpression}`;
        let countSearchQryStr = `?[where]${filterExpression}`;
        let searchColKey = this.appletViewSearchKeys[0];

        // TODO: Strip unsafe characters from search before constructing qry str
        if (this.search) {
          console.log(`COMP: Searching in column "${searchColKey}"`);
          dataSearchQryStr = `filter[where]${filterExpression}&filter[where][${searchColKey}][like]=%25${this.search}%25`;
          countSearchQryStr = `?[where][and][0]${filterExpression}&[where][and][1][${searchColKey}][like]=%25${this.search}%25`;
        }

        const baseDataUrl = this.$applet.baseDataUrl(this.applet);
        const baseCountUrl = `${baseDataUrl}/count`;
        const includeQryStr = (this.appletView.includeExpression && `${this.appletView.includeExpression}`) || '';
        const dataUrl = `${baseDataUrl}?${_.filter([dataSearchQryStr, dataSortingAndPagingQryStr, includeQryStr]).join('&')}`;
        const countUrl = `${baseCountUrl}${countSearchQryStr}`;

        console.time(`AXIOS: Getting ${this.modelPluralName}...`);
        let dataResponse = await this.$axios.get(dataUrl);

        console.timeEnd(`AXIOS: Getting ${this.modelPluralName}...`);
        this.rows = dataResponse.data;

        console.time(`AXIOS: Getting ${this.modelPluralName} count...`);
        let countResponse = await this.$axios.get(countUrl);

        this.totalItems = countResponse.data.count;
        console.timeEnd(`AXIOS: Getting ${this.modelPluralName} count...`);
        console.log(`AXIOS: ${this.modelPluralName} count`, this.totalItems);
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

        // Now that we have the model, use it to formulate and cache the property validators for the details view
        this.detail.validate = this.$model.propertyValidators(this.editableModelProps);

        this.columns = [];
        this.columns.push({ text: '', value: 'rowSelectionIndicator', align: 'left', sortable: false });

        _(this.appletView.properties).forEach(val => {
          this.columns.push({ text: val.label || this.$helpers.toTitleCase(val.key), value: val.key, align: 'left', sortable: this.$applet.viewPropIsSortable(val) });
        });

        // Must set default page, sortBy column, and sort order. Also set default rowsPerPage based on screen size
        this.pagination = _.merge({ page: 1 }, this.appletViewSortSpec, { rowsPerPage: this.defaultRowsPerPage });
      } catch (e) {
        this.columns = [];
        console.log('COMP: Error getting metadata:', e);
        return false;
      }

      console.log('COMP: Got columns metadata');
      return true;
    },

    cellValue(row, col) {
      return _.get(row.item, col.key, '');
    },

    clearAllSelections() {
      this.selected.splice(0);
    },

    clearSearch() {
      this.searchInputOpen = false;
      this.search = '';
    },

    rowClick(row) {
      _.delay(
        (row, vm) => {
          console.log('COMP: Clicked on an item');
          if (vm.inRowDblClick) {
            console.log('COMP: ...item single-click skipped while double-click in progress');
            return;
          }

          if (!row.selected) vm.clearAllSelections(); // We only allow single selection (for now)
          row.selected = !row.selected;
        },
        200,
        row,
        this
      );
    },

    rowDblClick(row) {
      let vm = this;
      try {
        this.inRowDblClick = true;

        // Ensure that "in-row-double-click" flag will soon be cleared
        setTimeout(() => (vm.inRowDblClick = false), 500);

        // Handle various conditions, such as dbl-click on an item when another item is already selected
        if (!row.selected) this.selected.splice(0); // Remove all elements... we only allow single selection (for now)
        row.selected = true; // Select the row, or if the row was already selected don't allow any initial single-click to de-select it

        // Give Vue a chance to update the enabled state of the Edit button we're about to click on the toolbar...
        Vue.nextTick(() => {
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
    }, 200),

    debounceSearch: _.debounce(async function() {
      console.log('COMP: Search input changed >>>', this.search);
      await this.getRows();
      this.pagination.page = 1;
    }, 500),

    debounceViewChange: _.debounce(async function() {
      console.log('COMP: View Selection changed');
      try {
        this.inViewChange = true;
        this.clearAllSelections();
        this.clearSearch();
        await this.getColumns();
        await this.getRows();
      } catch (e) {}
      this.inViewChange = false;
    }, 200),

    textInputType(prop) {
      let typeHints = `${prop.key} ${prop.type} ${prop.description}`.toLowerCase();
      if (typeHints.includes('email')) return 'email';
      else if (typeHints.includes('phone')) return 'phone';
      else if (typeHints.includes('date')) return 'date';
      else return 'text';
    },

    textInputMask(prop) {
      let maskHints = `${prop.key} ${prop.type} ${prop.description}`.toLowerCase();
      if (maskHints.includes('phone')) return 'phone';
      else return undefined;
    },

    scrollDetailsToTop() {
      // Force details view to scroll back to the top... in case it was scrolled-down last time it was visible
      let vm = this;
      Vue.nextTick(() => {
        let detailsBody = vm.$refs.detailDialogBody;
        detailsBody.scrollTop = 0;
      });
    },

    onNew() {
      // Get some info needed below
      let fkModelName = this.$model.firstRelationName(this.model);
      let fkModelKey = this.$model.keyFromSingularName(fkModelName);
      let fkPropKey = this.$model.firstRelationFK(this.model);
      let fkApplet = this.$applet.fromModelKey(fkModelKey);
      let fkAppletName = (fkApplet && fkApplet.name) || fkModelName;

      // Can't create a new item when it requires a foreign key (we have a fkPropKey) and the FK hasn't been set (by "pinning" the primary item)
      if (fkPropKey) {
        console.log(`COMP: New item for model related to "${fkModelName}" (${fkModelKey}) by FK "${fkPropKey}"`);

        // Sanity check... make sure FK model is pinnable
        if (!fkApplet || !fkApplet.hasPinnableModel) {
          this.flashSnackbar({ msg: `Oops, parent applet/model "${fkAppletName}" isn't configured for new items!`, mode: 'error' });
          return;
        }

        // Now check that an instance (item) of the FK model has indeed been pinned
        if (!this.$model.itemIsPinned(fkModelKey)) {
          // TODO: Change msg to indicate that a Quick Action could be used instead of pinning first
          this.flashSnackbar({ msg: `Please pin an item in the "${fkAppletName}" applet first!` });
          return;
        }
      }

      // Assign new (blank) model item to the detail dialog's value object and show dialog
      _.assign(this.detail.values, this.$model.newInstance(this.model));
      this.detail.mode = 'Add';
      this.detail.dialog = true;
      this.scrollDetailsToTop();
    },

    onEdit(row) {
      _.assign(this.detail.values, row);
      this.detail.mode = 'Edit';
      this.detail.dialog = true;
      this.scrollDetailsToTop();
    },

    async onSave() {
      if (!this.$refs.detailDialogForm.validate()) return;

      let response = null;
      const url = this.$applet.baseDataUrl(this.applet);

      try {
        // ADD case
        if (this.detail.mode === 'Add') {
          console.log('AXIOS: Adding item...');

          let postObj = { ...this.detail.values, User: this.$auth.userName };

          let fkPropKey = this.$model.firstRelationFK(this.model);
          if (fkPropKey) postObj[fkPropKey] = this.pinnedItem.key;

          response = await this.$axios.post(url, postObj);

          console.log(`AXIOS: ${this.modelPluralName} post successful`);
          this.flashSnackbar({ msg: 'New Item Saved!', mode: 'success' });
        } else if (this.detail.mode === 'Edit') {
          // EDIT case
          console.log('AXIOS: Editing item...');

          let patchObj = { ...this.detail.values, User: this.$auth.userName };
          response = await this.$axios.patch(url, patchObj);

          console.log(`AXIOS: ${this.modelPluralName} patch successful`);
          this.flashSnackbar({ msg: 'Item Changes Saved!', mode: 'success' });
        }

        // Housekeeping: Make sure selected item data is cleared and refresh grid data
        this.clearAllSelections();
        await this.getRows();
      } catch (e) {
        console.log(`AXIOS: ${this.detail.mode} ${this.modelPluralName} error`, e);
        this.flashSnackbar({ msg: `Failed to ${this.detail.mode} Item!`, mode: 'error' });
      }

      this.detail.dialog = false;
    },

    async onDelete(row) {
      try {
        const patchUrl = this.$applet.baseDataUrl(this.applet);
        let patchObj = {
          [this.$model.primaryKeyPropertyKey]: row[this.$model.primaryKeyPropertyKey],
          User: this.$auth.userName,
          [this.$model.recycledFlagPropertyKey]: 1
        };

        console.log(`AXIOS: Patching ${this.modelPluralName}...`);
        let patchResponse = await this.$axios.patch(patchUrl, patchObj);
        console.log(`AXIOS: ${this.modelPluralName} patch successful`);
        this.flashSnackbar({ msg: 'Item Recycled!', mode: 'success' });

        // Housekeeping: Make sure recycled item isn't selected or pinned, and refresh grid data
        this.clearAllSelections();
        if (row[this.$model.primaryKeyPropertyKey] === this.pinnedItem.key) this.onTogglePin(row);
        await this.getRows();
      } catch (e) {
        console.log(`AXIOS: ${this.modelPluralName} patch error`, e);
        this.flashSnackbar({ msg: `Error deleting item from ${this.modelPluralName}`, mode: 'error' });
      }
    },

    onTogglePin(row) {
      // TODO: Hide details of pinnedItem object structure inside mutation and add "clearPinnedItem" mutation
      let newPinnedItem = { key: '', model: { key: '' } };
      let newState = this.hasPinnedItem ? 'unpin' : 'pin';

      if (newState === 'pin') {
        newPinnedItem = { key: row[this.$model.primaryKeyPropertyKey], model: { key: this.modelKey } };
      }

      // Changes to the pinned item have the side-effect of changing the selected view, which in turn
      // resets selection and search and reloads columns and rows
      this.setPinnedItem(newPinnedItem);
      this.flashSnackbar({ msg: `Item ${newState}ned!`, mode: 'success' });
    },

    ...mapMutations(['setPinnedItem']),
    ...mapActions(['loadModelByKey', 'flashSnackbar'])
  }
};
</script>

<style lang="stylus" scoped>
@require '~@vuept/ui/stylus/variables'
@require '~vuetify/src/stylus/settings/_colors'

/* Toolbar icon btns need to be slightly more dense for mobile */
.vp-items-toolbar-extra-dense .v-btn--icon
  margin: 2px

.vp-items-search-btn
  margin: 0 2px 0 0

/* Search input is hidden at first */
.vp-items-search-input
  margin: -14px -4px 0 2px
  min-width: 0
  max-width: 0

/* Search input expands when "-open" class is applied */
.vp-items-search-input.vp-items-search-input-open
  margin: -14px 0 0 2px
  min-width: 140px
  max-width: 160px

/* Tweak size and position of "Views" menu on right of toolbar */
.vp-items-views-menu
  height: 36px

/* The hover area around the "Views" menu needs styling */
.vp-items-views-menu-hover
  padding: 2px 5px 4px 5px
  border-radius: 20px

/* The icon in the first column of the grid, displayed when an item is selected */
.vp-items-selection-icon
  float: left
  margin: 0 -18px 0 9px
  font-size: 22px

.vp-items-detail-dialog-wrapper
  position: absolute
  top: $vp-toolbar-height
  right: 0
  margin: 0 !important
  height: 100vh
  border-radius: 0%

  & .v-card__title,
  & .v-card__actions
    flex: none
    height: $vp-items-toolbar-height
    background-color: $grey.lighten-3

.vp-items-detail-dialog-body
  background-color: white
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
  min-width: 23px;
  width: 23px;
}
</style>
