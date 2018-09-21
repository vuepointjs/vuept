<template>

  <!--
  <div style="margin-left: 30px; width: 300px; height: 110px;" class="blue lighten-2 pa-2">
    <h2>{{ $route.params.applet }} Applet Items</h2>
    <b>TODO:</b>&nbsp;
    <i>Cards</i> View Component
    <br>
    <v-icon large color="green darken-3">dashboard</v-icon>
  </div>
  -->

  <v-container fluid grid-list-md>
    <v-layout column>
      <v-flex>

        <h2>{{ $applet.fromRoute(this.$route, this.$store).name }} - All Items</h2>
        <div style="width: 100%; height: 40px; background-color: #efefef; margin: 5px"></div>
      </v-flex>

      <v-data-iterator :items="items" :rows-per-page-items="rowsPerPageItems" :pagination.sync="pagination" content-tag="v-layout" hide-actions
        row wrap align-start>

        <!--
      <v-toolbar slot="header" class="mb-2" color="indigo darken-5" dark flat>
        <v-toolbar-title>This is a header</v-toolbar-title>
      </v-toolbar>
      -->

        <!-- Grid classes dictate that "cards" are arranged, from largest- to smallest-width screen: 4 wide, 3 wide, 2 wide, 1 wide -->
        <v-flex slot="item" slot-scope="props" xs12 sm6 md4 lg3>

          <v-expansion-panel focusable>
            <v-expansion-panel-content>
              <div slot="header">{{ props.item.name }}</div>
              <applets-nav-panel :applets="applets" dense />
            </v-expansion-panel-content>
          </v-expansion-panel>

        </v-flex>

        <!--
      <v-toolbar slot="footer" class="mt-2" color="indigo" dark dense flat>
        <v-toolbar-title class="subheading">This is a footer</v-toolbar-title>
      </v-toolbar>
      -->

      </v-data-iterator>

    </v-layout>

  </v-container>

</template>

<script>
import AppletsNavPanel from '@vuept/ui/components/AppletsNavPanel.vue';

export default {
  components: {
    AppletsNavPanel
  },

  props: {},

  data() {
    return {
      rowsPerPageItems: [100],
      pagination: {
        rowsPerPage: 100
      },
      items: [
        {
          name: 'Smith, John'
        },
        {
          name: 'Doe, Jane'
        },
        {
          name: 'Jones, Mark'
        },
        {
          name: 'Abbott, Jim'
        },
        {
          name: 'Baker, Joyce'
        }
      ]
    };
  },

  created() {
    console.log('COMP: Created /applet/list <items-as-cards>');
  },

  mounted() {
    console.log('COMP: Mounted /applet/list <items-as-cards>');
  },

  beforeDestroy() {},

  destroyed() {
    console.log('COMP: Destroyed /applet/list <items-as-cards>');
  },

  computed: {
    mediaSize() {
      return this.$vuetify.breakpoint.name;
    },

    applets() {
      let items = _(this.$store.state.app.applets)
        // Sort by ordinal (ord) ascending
        .orderBy('ord', 'asc')
        // Add random icon colors and some example open item counts for badges
        .map(val => ({
          ...val,
          iconColor: val.iconColor || this.$helpers.colorFromIndex(val.ord - 1),
          openItemCount: ['RF', 'LF', 'CT', 'BV', 'PA'].includes(val.key) ? 1 : 0
        }))
        // Create a label that includes name and open item count (for tooltips)
        .map(val => ({
          ...val,
          label: val.openItemCount > 0 ? `${val.name} (${val.openItemCount} Open Items)` : val.name
        }))
        .value();

      return items;
    }
  }
};
</script>

<style scoped>
</style>
