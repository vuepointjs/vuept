<template>
  <v-menu dark offset-y :close-on-content-click="false" :nudge-width="200" v-model="userMenu">
    <v-btn icon slot="activator">
      <v-icon>account_circle</v-icon>
    </v-btn>

    <v-card light>
      <v-list>
        <v-list-tile avatar>
          <v-list-tile-avatar>
            <v-icon large>verified_user</v-icon>
          </v-list-tile-avatar>

          <v-list-tile-content>
            <v-list-tile-title>User Full Name Here</v-list-tile-title>
            <v-list-tile-sub-title>User Email Here</v-list-tile-sub-title>
          </v-list-tile-content>

        </v-list-tile>
      </v-list>

      <v-divider></v-divider>
      <!-- <v-chip v-for="role in userRoles" :key="role" :outline="true" :small="true">{{ role }}</v-chip> -->

      <v-divider></v-divider>
      <v-list>
        <v-list-tile>
          <v-list-tile-avatar>
            <v-icon large>info</v-icon>
          </v-list-tile-avatar>

          <v-list-tile-content>
            <v-list-tile-title>{{ taxonomy.suiteName }} Suite</v-list-tile-title>
            <v-list-tile-sub-title>Version {{ taxonomy.suiteVersion }}</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>

      <v-divider></v-divider>
      <!-- <v-list>
              <v-list-tile>
                <v-list-tile-title>Details, Messages, etc...</v-list-tile-title>
              </v-list-tile>
            </v-list> -->

      <v-card-actions>
        <!-- <v-btn color="grey" flat v-clipboard:copy="userApiToken" v-clipboard:success="onCopyApiTokenSuccess" v-clipboard:error="onCopyApiTokenError">
          <v-icon dark>content_paste</v-icon>API Token
        </v-btn>
        <v-spacer></v-spacer> -->
        <v-btn color="primary" flat @click="clickLogout">Log out</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>

</template>

<script>
export default {
  data: () => ({
    userMenu: false
  }),

  methods: {
    clickLogout() {
      this.userMenu = false;
      this.logOut();
    },

    logOut() {
      // authentication.signOut();
      // this.clearUserProfile();
    }
  },

  computed: {
    taxonomy() {
      return this.$store.state.ui.taxonomy;
    }
  }
};
</script>

<style scoped>
</style>
