<template>

  <!--
  <div style="margin-left: 30px; width: 300px; height: 110px;" class="blue lighten-2 pa-2">
    <h2>{{ $route.params.applet }} Applet Items</h2>
    <b>TODO:</b>&nbsp;
    <i>Grid</i> View Component
    <br>
    <v-icon large color="red darken-3">list</v-icon>
  </div>
  -->

  <v-container fluid grid-list-md>
    <v-layout>
      <v-flex>
        <h2>{{ $applet.fromRoute(this.$route, this.$store).name }} - All Items</h2>
        <div style="width: 100%; height: 40px; background-color: #efefef; margin: 5px"></div>

        <v-data-table :loading="false" :must-sort="true" :headers="[]" :items="[]" :total-items="0" rows-per-page-text="Rows:" :rows-per-page-items="rowsOptions">
          <template slot="items" slot-scope="propsExample">
            <td>
              <v-menu bottom left>
                <v-btn icon slot="activator">
                  <v-icon>more_vert</v-icon>
                </v-btn>
              </v-menu>
            </td>
            <td>Coming</td>
            <td>Soon</td>
            <td>Item</td>
            <td>Details</td>
          </template>
        </v-data-table>

      </v-flex>
    </v-layout>
  </v-container>

</template>

<script>
export default {
  props: {},

  data() {
    return {
      rowsOptions: [5, 10, 25, 100, 500]
    };
  },

  created() {
    console.log('COMP: Created /applet/list <items-as-grid>');
  },

  mounted() {
    console.log('COMP: Mounted /applet/list <items-as-grid>');
  },

  beforeDestroy() {},

  destroyed() {
    console.log('COMP: Destroyed /applet/list <items-as-grid>');
  }
};
</script>

<style scoped>
</style>
