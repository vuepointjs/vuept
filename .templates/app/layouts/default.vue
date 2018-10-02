<template>
  <v-app light>
    <suite-bar @waffle-click="drawer = !drawer" />

    <v-navigation-drawer temporary fixed light v-model="drawer" width="320">
      <v-card flat>
        <!-- Drawer waffle menu -->
        <v-btn flat icon @click="drawer = !drawer">
          <v-icon>apps</v-icon>
        </v-btn>
      </v-card>

      <!-- Panel must be destroyed (v-if) when drawer closed so that any tooltips are cleared too -->
      <applets-nav-panel v-if="drawer" :applets="applets" @active-applet-click="drawer = false" />
    </v-navigation-drawer>

    <v-content>
      <!-- <v-container fluid>
        <v-layout align-start row> -->
      <nuxt />
      <!-- </v-layout>
      </v-container> -->
    </v-content>

    <!--
    <v-footer :fixed="fixedFooter" app class="pa-3 shaded">
      <v-spacer></v-spacer>
      <div class="vp-app-footer-text">{{ taxonomy.suiteName }} | {{ taxonomy.appName }}</div>
    </v-footer>
    -->

    <v-snackbar :timeout="0" :top="true" :right="true" v-model="snackbar.show" :color="$helpers.snackbarColorFromMode(snackbar.mode)">
      <v-icon dark>{{ $helpers.snackbarIconFromMode(snackbar.mode) }}</v-icon>&nbsp;{{ snackbar.msg }}
      <!-- <v-btn flat color="pink" @click.native="snackbar.show = false">Close</v-btn> -->
    </v-snackbar>
  </v-app>
</template>

<script>
import SuiteBar from '@vuept/ui/components/SuiteBar.vue';
import AppletsNavPanel from '@vuept/ui/components/AppletsNavPanel.vue';
import _ from 'lodash';

export default {
  components: {
    SuiteBar,
    AppletsNavPanel
  },

  data: () => ({
    drawer: false,
    fixedFooter: true
    // appletsNavPanelDocs: AppletsNavPanel.__docs
  }),

  created() {
    console.log('LAYOUT: Created "default" layout');
  },

  mounted() {
    let vm = this;

    this.$mousetrap.bind('shift+enter', (evt, combo) => {
      console.log(`KBD: "${combo}" triggered`);
      vm.drawer = !vm.drawer;
    });

    this.$mousetrap.bind('shift+home', (evt, combo) => {
      console.log(`KBD: "${combo}" triggered`);
      this.$router.push('/');
    });

    console.log('LAYOUT: Mounted "default" layout');
  },

  computed: {
    applets() {
      let items = _(this.$store.state.app.applets)
        // Sort by ordinal (ord) ascending
        .orderBy('ord', 'asc')
        // Add random icon colors and some example open item counts for badges
        .map(val => ({
          ...val,
          iconColor: val.iconColor || this.$helpers.colorFromIndex(val.ord - 1),
          openItemCount: ['RF', 'LF', 'CT', 'BV', 'PA'].includes(val.key) ? val.ord : 0
        }))
        // Create a label that includes name and open item count (for tooltips)
        .map(val => ({
          ...val,
          label: val.openItemCount > 0 ? `${val.name} (${val.openItemCount} Open Items)` : val.name
        }))
        .value();

      return items;
    },

    taxonomy() {
      return this.$store.state.ui.taxonomy;
    },

    snackbar() {
      return this.$store.state.ui.snackbar;
    }
  }
};
</script>

<style lang="stylus">
.vp-app-footer-text
  font-size: 12px
</style>
