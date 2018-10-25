<template>
  <v-app light>
    <suite-bar @waffle-click="drawer = !drawer" />

    <v-navigation-drawer temporary fixed light v-model="drawer" width="320">
      <v-card flat>
        <!-- Drawer waffle menu -->
        <v-btn flat icon @click="drawer = !drawer">
          <v-icon>apps</v-icon>
        </v-btn>

        <!-- Mimic the "Office 365" link found on O365 "app launcher" (waffle) menu -->
        <div class="vp-o365-link-container text-xs-right">
          <span class="vp-o365-link subheading red--text text--darken-3" @click="onO365Click">
            <span class="vp-o365-link-text">Office 365</span>
            <v-icon size="20" color="red darken-3">arrow_right_alt</v-icon>
          </span>
        </div>
      </v-card>

      <!-- Panel must be destroyed (v-if) when drawer closed so that any tooltips are cleared too -->
      <applets-nav-panel v-if="drawer" :applets="applets" @active-applet-click="drawer = false" @action-btn-click="drawer = false" />
    </v-navigation-drawer>

    <!-- Horizontal version of applets nav is experimental and shown only when explicitly configured -->
    <applets-nav-panel v-if="globalNavStyle === 'dock-applets-always'" :applets="applets" dense horizontal />

    <v-content class="vp-layout-content">
      <nuxt />
    </v-content>

    <v-snackbar :timeout="0" :top="true" :right="true" v-model="snackbar.show" :color="$helpers.snackbarColorFromMode(snackbar.mode)">
      <v-icon dark>{{ $helpers.snackbarIconFromMode(snackbar.mode) }}</v-icon>&nbsp;{{ snackbar.msg }}
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
    this.$local.defaults({ globalNavStyle: 'launcher-only' });

    // TODO: consider how to expose user settings in UI and how to store them in local storage
    // this.$local.set('globalNavStyle', 'dock-applets-always');
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
    globalNavStyle() {
      return this.$local.get('globalNavStyle');
    },

    applets() {
      let items = _(this.$store.state.app.applets)
        // Sort by ordinal (ord) ascending
        .orderBy('ord', 'asc')
        // Add random icon colors and some example open item counts for badges
        .map(val => ({
          ...val,
          iconColor: val.iconColor || this.$helpers.colorFromIndex(val.ord - 1),
          // openItemCount: ['DI', 'RF', 'LF', 'CT', 'BV', 'PA'].includes(val.key) ? val.ord : 0
          openItemCount: 0
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
  },

  methods: {
    onO365Click() {
      window.open('https://www.office.com/?auth=2&home=1&from=ShellLogo', '_blank');
    }
  }
};
</script>

<style lang="stylus">
.vp-o365-link-container
  padding: 12px 22px 0 0

.vp-o365-link
  cursor: pointer

.vp-o365-link-text
  padding-right: 7px

  &:hover
    text-decoration: underline

// When main content has the optional applets nav panel ("tabs" look) rendered above it, we need
// to adjust the padding of the main content accordingly
.vp-applets-nav-panel-horizontal + .vp-layout-content,
div.application--wrap > .vp-applets-nav-panel-horizontal + main.v-content
  padding: 0 !important
</style>
