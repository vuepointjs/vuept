<template>
  <v-menu dark offset-y :close-on-content-click="false" :nudge-width="300" v-model="userMenu">
    <v-btn icon slot="activator">
      <v-icon>account_circle</v-icon>
    </v-btn>

    <v-card light>
      <!-- User -->
      <v-list>
        <v-list-tile avatar>
          <v-list-tile-avatar>
            <v-icon large>verified_user</v-icon>
          </v-list-tile-avatar>

          <v-list-tile-content>
            <v-list-tile-title>{{ $auth.userFullName }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ $auth.userEmail }}</v-list-tile-sub-title>
          </v-list-tile-content>

        </v-list-tile>
      </v-list>

      <!-- Roles -->
      <v-divider></v-divider>
      <v-list>
        <v-list-tile avatar>
          <v-list-tile-avatar>
            <v-icon large>assignment_ind</v-icon>
          </v-list-tile-avatar>

          <v-list-tile-content>
            <v-list-tile-title>Roles</v-list-tile-title>
            <v-list-tile-sub-title>
              <v-chip v-for="role in $auth.userRoles" :key="role" :outline="true" :small="true">{{ role }}</v-chip>
            </v-list-tile-sub-title>
          </v-list-tile-content>

        </v-list-tile>
      </v-list>

      <!-- Suite Info -->
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
      <!--
        <v-list>
          <v-list-tile>
            <v-list-tile-title>Details, Messages, etc...</v-list-tile-title>
          </v-list-tile>
        </v-list>
      -->

      <v-card-actions>
        <v-btn color="grey" flat v-clipboard:copy="$auth.apiToken" v-clipboard:success="onCopyApiTokenSuccess" v-clipboard:error="onCopyApiTokenError">
          <v-icon dark>content_paste</v-icon>API Token
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat @click="clickLogout">Log out</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>

</template>

<script>
import { mapActions } from 'vuex';

export default {
  data: () => ({
    userMenu: false
  }),

  methods: {
    onCopyApiTokenSuccess() {
      console.log('User API Token copied to clipboard successfully');
      this.flashSnackbar({ msg: 'Token Copied to Clipboard!', mode: 'success' });
    },

    onCopyApiTokenError() {
      console.log('User API Token copying error');
      this.flashSnackbar({ msg: 'Error Copying Token to Clipboard!', mode: 'error' });
    },

    clickLogout() {
      this.userMenu = false;
      this.logOut();
    },

    logOut() {
      this.$auth.signOut();
    },

    ...mapActions(['flashSnackbar'])
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
