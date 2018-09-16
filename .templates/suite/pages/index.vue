<template>
  <v-container>
    <v-layout>
      <v-flex xs12 lg10 offset-lg1 xl6 offset-xl3>
        <app-welcome-card />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import AppWelcomeCard from '@vuept/ui/components/AppWelcomeCard.vue';

export default {
  components: {
    AppWelcomeCard
  },

  created() {
    console.log('PAGE: Created /');
  },

  mounted() {
    console.log('PAGE: Mounted /');
  }
};
</script>

<style scoped>
</style>
