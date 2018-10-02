<template>
  <div>

  </div>
</template>

<script>
export default {
  props: {},

  data: () => ({}),

  async created() {
    console.log('COMP: Created <confirmation-popup>');
  },

  mounted() {
    // this.mountKeybindings();
    console.log('COMP: Mounted <confirmation-popup>');
  },

  beforeDestroy() {
    // this.unmountKeybindings();
  },

  destroyed() {
    console.log('COMP: Destroyed <confirmation-popup>');
  }
};
</script>

<style scoped>
</style>
