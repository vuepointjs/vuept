<template>
  <div style="margin-left: 30px; width: 300px; height: 110px;" class="blue lighten-2 pa-2">
    <h2>{{ $route.params.applet }} Applet Page</h2>
    <b>TODO:</b>&nbsp;
    <i>Markdown</i> Body Component
    <br>
    <v-icon large color="blue darken-3">code</v-icon>
  </div>
</template>

<script>
export default {
  props: {},

  data: () => ({}),

  created() {
    console.log('COMP: Created /applet/page <body-as-markdown>');
  },

  mounted() {
    console.log('COMP: Mounted /applet/page <body-as-markdown>');
  },

  beforeDestroy() {},

  destroyed() {
    console.log('COMP: Destroyed /applet/page <body-as-markdown>');
  }
};
</script>

<style scoped>
</style>
