<template>

  <!--
  <h1>Main Page for Applet:&nbsp;
    <i>{{ applet.name }} ({{ applet.key }})</i>
  </h1>
  <br>
  -->

  <component :is="appletListViewComponent" />

</template>

<script>
import BodyAsMarkdown from '@vuept/ui/components/applet/page/BodyAsMarkdown.vue';
import ItemsAsCards from '@vuept/ui/components/applet/list/ItemsAsCards.vue';
import ItemsAsGrid from '@vuept/ui/components/applet/list/ItemsAsGrid.vue';

export default {
  validate({ params, store }) {
    // Valid applet key?
    let isValidAppletKey = store.state.app.applets.some(item => item.key.toUpperCase() === params.applet.toUpperCase());

    console.log(`PAGE: /:applet route validation... ${JSON.stringify(params)} is ${isValidAppletKey ? 'a valid' : 'an invalid'} route`);
    return isValidAppletKey;
  },

  components: {
    'applet-body-as-markdown': BodyAsMarkdown,
    'applet-items-as-cards': ItemsAsCards,
    'applet-items-as-grid': ItemsAsGrid
  },

  data: () => ({}),

  created() {
    console.log(`PAGE: Created /:applet for ${JSON.stringify(this.$route.params)}`);
  },

  mounted() {
    console.log(`PAGE: Mounted /:applet for ${JSON.stringify(this.$route.params)}`);
  },

  computed: {
    applet() {
      return this.$applet.fromRoute(this.$route);
    },

    appletListViewComponent() {
      let listViewSubType = this.$applet.viewByType(this.applet, 'List').subType;
      // Default to list style 'Grid' if not otherwise specified
      return listViewSubType ? `applet-items-as-${listViewSubType.toLowerCase()}` : 'applet-items-as-grid';
    }
  }
};
</script>

<style scoped>
</style>
