<template>
  <v-toolbar fixed app dark class="primary">
    <!-- Suite Bar waffle menu -->
    <v-toolbar-side-icon @click="waffleClickEmit" class="secondary">
      <v-icon>apps</v-icon>
    </v-toolbar-side-icon>

    <!-- Titles -->
    <span class="vp-toolbar-text">
      <nuxt-link to="/">
        {{ suiteBarTitles.suiteName }}
      </nuxt-link>
    </span>
    <v-divider :class="suiteBarTitles.dividerClasses" inset vertical></v-divider>
    <span class="vp-toolbar-text">
      <nuxt-link to="/">
        {{ suiteBarTitles.appName }}
      </nuxt-link>
    </span>
    <template v-if="activeApplet.key">
      <v-divider :class="suiteBarTitles.dividerClasses" inset vertical></v-divider>
      <span class="vp-toolbar-text">
        {{ suiteBarTitles.appletName }}
      </span>
    </template>
  </v-toolbar>
</template>

<script>
export default {
  data: () => ({}),

  created() {
    console.log('COMP: Created <suite-bar>');
  },

  mounted() {
    console.log('COMP: Mounted <suite-bar>');
  },

  destroyed() {
    console.log('COMP: Destroyed <suite-bar>');
  },

  methods: {
    waffleClickEmit() {
      this.$emit('waffle-click');
    }
  },

  computed: {
    mediaSize() {
      return this.$vuetify.breakpoint.name;
    },

    mediaPixelWidth() {
      return this.$vuetify.breakpoint.width;
    },

    activeApplet() {
      return this.$helpers.activeAppletFromRoute(this.$route, this.$store);
    },

    taxonomy() {
      return this.$store.state.ui.taxonomy;
    },

    suiteBarTitles() {
      let applet = this.activeApplet;

      return {
        suiteName: this.mediaSize === 'xs' ? this.taxonomy.suiteShortName : this.taxonomy.suiteName,
        appName: this.mediaSize === 'xs' ? this.taxonomy.appShortName : this.taxonomy.appName,
        appletName: this.mediaSize === 'xs' ? applet.shortName : applet.name,
        dividerClasses: this.mediaPixelWidth <= 420 ? 'mx-2' : 'mx-3'
      };
    }
  }
};
</script>

<style lang="stylus">
@require '~@/assets/vp/stylus/variables'
@require '~@/assets/vp/stylus/selectors'

{vp-toolbar}
  & .v-divider--vertical
    background-color: #ffffff45

.vp-toolbar-text
  white-space: nowrap
  font-size: 17px

  &:nth-of-type(1)
    margin-left: $vp-toolbar-height

  & a
    color: white
    text-decoration: none
</style>
