<template>
  <div class="vp-applets-nav-panel" :class="{ 'vp-applets-nav-panel-horizontal': horizontal }">
    <v-card flat>
      <template v-if="!horizontal">
        <template v-if="pinnedItemTitle">
          <v-card-title primary-title class="pt-0 pb-1 grey--text vp-applets-nav-heading">
            <div>
              <h3 v-if="!dense" class="headline">Pinned {{ pinnedItemAppletSingularName }}</h3>
            </div>
          </v-card-title>

          <div class="vp-applets-nav-pinned-title title text-truncate">
            <v-btn icon @click="onUnpin" class="grey lighten-2">
              <v-tooltip bottom>
                <v-icon color="secondary" slot="activator">person_pin_circle</v-icon>
                <span>Unpin</span>
              </v-tooltip>
            </v-btn>
            {{ pinnedItemTitle }}
          </div>
        </template>

        <v-card-title primary-title class="pt-0 pb-1 grey--text vp-applets-nav-heading">
          <div>
            <h3 v-if="!dense" class="headline">Applets</h3>
          </div>
        </v-card-title>
      </template>

      <v-container fluid class="vp-applet-nav-items-container">
        <v-layout row wrap justify-start>
          <template v-if="horizontal && pinnedItemTitle">
            <div class="vp-applets-nav-pinned-title subheading text-truncate">
              <v-btn icon @click="onUnpin" class="grey lighten-2">
                <v-tooltip bottom>
                  <v-icon color="secondary" slot="activator">person_pin_circle</v-icon>
                  <span>Unpin</span>
                </v-tooltip>
              </v-btn>
              {{ pinnedItemTitle }}
            </div>
            <v-divider vertical></v-divider>
          </template>

          <div v-for="applet in applets" class="vp-applet-nav-item" :class="{'vp-applet-nav-item-dense': dense}" :key="applet.key">
            <v-tooltip max-width="80" open-delay="50" close-delay="50" v-bind="tooltipAttrsFromIndex(applet.ord)"
              v-model="appletTooltipShow[applet.ord - 1]">
              <v-badge overlap slot="activator">
                <span v-if="applet.openItemCount > 0" slot="badge">{{ applet.openItemCount }}</span>
                <nuxt-link :to="$applet.baseRouteFromKey(applet.key)">
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
import { mapMutations } from 'vuex';

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
    },
    horizontal: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  data: () => ({
    appletTooltipShow: [] // Array of bools, one for each applet
  }),

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
        .map(val => this.$applet.keybindingFromKey(val.key))
        .value();

      return items;
    },

    pinnedItemAppletSingularName() {
      return this.$applet.singularName(this.$applet.fromPinnedItem());
    },
    pinnedItemTitle() {
      return this.$store.state.ui.pinnedItem.title;
    },

    shouldMountKeybindings() {
      // In horizontal ("tabs") arrangement we assume we aren't in a menu and therefore should *not* mount keybindings
      // because they are (for now) only intended for use within the "mode" of an open menu
      return !this.horizontal;
    }
  },

  methods: {
    appletLinkClickEmit(key) {
      if (this.$applet.routeIsActive(key, this.$route)) this.$emit('active-applet-click');
    },

    mountKeybindings() {
      let vm = this;

      if (!this.shouldMountKeybindings) return;

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
        let key = this.$applet.keyFromKeybinding(combo);
        let route = this.$applet.baseRouteFromKey(key);
        this.$router.push(route);
        this.appletLinkClickEmit(key);
      });
    },

    unmountKeybindings() {
      if (!this.shouldMountKeybindings) return;

      this.$mousetrap.unbind(['f1', '?']);
      this.$mousetrap.unbind(this.appletKeybindings);
    },

    tooltipAttrsFromIndex(index) {
      // We may wish to vary the attributes according to the applet index, but for now
      // all applets can use the same set of attributes
      return { bottom: true, 'content-class': 'vp-applet-tooltip vp-applet-tooltip-nudge-up' };
    },

    onUnpin() {
      let newPinnedItem = { keyValue: '', title: '', model: { key: '' } };
      this.setPinnedItem(newPinnedItem);
      this.$emit('action-btn-click');
    },

    ...mapMutations(['setPinnedItem'])
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

.vp-applets-nav-pinned-title
  margin: 5px 5px 15px 30px
  width: 280px

.vp-applets-nav-panel-horizontal
  margin-bottom: -17px
  margin-left: -12px
  padding-top: 38px

  & .v-card
    background-color: aliceblue !important

  & .vp-applet-nav-item
    margin-bottom: 12px

  & .vp-applet-icon-container
    width: 34px
    height: 48px

  & .vp-applets-nav-pinned-title
    margin: 5px 0 0 -5px
    width: 140px
</style>
