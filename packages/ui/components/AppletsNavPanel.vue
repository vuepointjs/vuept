<template>
  <div class="vp-applets-nav-panel">
    <v-card flat>
      <v-card-title primary-title class="pt-0 pb-1 grey--text vp-applets-nav-heading">
        <div>
          <h3 v-if="!dense" class="headline">Applets</h3>
        </div>
      </v-card-title>
      <v-container fluid class="vp-applet-nav-items-container">
        <v-layout row wrap justify-start>

          <div v-for="applet in applets" class="vp-applet-nav-item" :class="{'vp-applet-nav-item-dense': dense}" :key="applet.key">
            <v-tooltip max-width="80" open-delay="50" close-delay="50" v-bind="tooltipAttrsFromIndex(applet.ord)" v-model="appletTooltipShow[applet.ord - 1]">
              <v-badge overlap slot="activator">
                <span v-if="applet.openItemCount > 0" slot="badge">{{ applet.openItemCount }}</span>
                <nuxt-link :to="$helpers.appletBaseRouteFromKey(applet.key)">
                  <div class="vp-applet-icon-container" @click="appletLinkClickEmit(applet.key)">

                    <v-avatar :style="{backgroundColor: applet.iconColor}" class="vp-applet-icon" :class="{'vp-applet-icon-dense': dense}">
                      <span class="white--text headline">{{ applet.iconLabel }}</span>
                    </v-avatar>

                  </div>
                </nuxt-link>
              </v-badge>

              <!-- Tooltip text -->
              <span>{{ applet.label }}</span>
            </v-tooltip>
          </div>

        </v-layout>
      </v-container>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    applets: {
      type: Array,
      required: true
    },
    dense: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  data() {
    return {
      appletTooltipShow: [] // Array of bools, one for each applet
    };
  },

  created() {
    console.log('COMP: Created <applets-nav-panel>');
    this.appletTooltipShow = new Array(this.appletsCount).fill(false);
  },

  mounted() {
    this.mountKeybindings();
    console.log('COMP: Mounted <applets-nav-panel>');
  },

  beforeDestroy() {
    this.unmountKeybindings();
  },

  destroyed() {
    console.log('COMP: Destroyed <applets-nav-panel>');
  },

  computed: {
    appletsCount() {
      return this.applets.length;
    },

    appletKeybindings() {
      let items = _(this.applets)
        .map(val => this.$helpers.appletKeybindingFromKey(val.key))
        .value();

      return items;
    }
  },

  methods: {
    appletLinkClickEmit(key) {
      if (this.$helpers.appletRouteActive(key, this.$route)) this.$emit('active-applet-click');
    },

    mountKeybindings() {
      let vm = this;

      // Briefly show applet label when a help key is pressed
      this.$mousetrap.bind(['f1', '?'], (evt, combo) => {
        console.log(`KBD: "${combo}" triggered`);

        vm.appletTooltipShow = new Array(vm.appletsCount).fill(true);
        setTimeout(() => {
          vm.appletTooltipShow = new Array(vm.appletsCount).fill(false);
        }, 4000);

        // Prevent default browser F1 behavior
        return false;
      });

      // Navigate to applet's home page when sequence of keys pressed that match its 2 character "key" value
      this.$mousetrap.bind(this.appletKeybindings, (evt, combo) => {
        console.log(`KBD: "${combo}" triggered`);
        let key = this.$helpers.appletKeyFromKeybinding(combo);
        let route = this.$helpers.appletBaseRouteFromKey(key);
        this.$router.push(route);
        this.appletLinkClickEmit(key);
      });
    },

    unmountKeybindings() {
      this.$mousetrap.unbind(['f1', '?']);
      this.$mousetrap.unbind(this.appletKeybindings);
    },

    tooltipAttrsFromIndex(index) {
      // We may wish to vary the attributes according to the applet index, but for now
      // all applets can use the same set of attributes
      return { bottom: true, 'content-class': 'vp-applet-tooltip vp-applet-tooltip-nudge-up' };
    }
  }
};
</script>

<style lang="stylus" scoped>
@require '~@vuept/ui/stylus/variables'

.vp-applet-nav-items-container
  padding: 12px 10px 12px 24px

.vp-applet-nav-item
  margin-bottom: 16px
  margin-left: 12px
  width: 77px

  &.vp-applet-nav-item-dense
    width: 50px

  & a
    text-decoration: none

.vp-applet-icon-container
  display: flex
  justify-content: center
  align-items: center
  width: $vp-applet-lg-size + 12px
  height: $vp-applet-lg-size + 12px
  border-bottom: 3px

.vp-applet-nav-item .nuxt-link-active .vp-applet-icon-container // Active route/applet
  border-bottom: 3px solid $vp-color.accent

.vp-applet-icon
  width: $vp-applet-lg-size !important
  height: $vp-applet-lg-size !important
  border-radius: 2px

  &.vp-applet-icon-dense
    width: $vp-applet-sm-size !important
    height: $vp-applet-sm-size !important

.vp-applet-tooltip
  margin-top: 8px
  padding: 3px 4px
  text-align: center
  font-size: 11px
  line-height: 13px

  &.menuable__content__active
    opacity: 0.8 !important

.vp-applet-tooltip-nudge-up
  margin-top: -12px
</style>
