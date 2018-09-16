<template>
  <v-card class="vp-card-welcome">
    <v-card-title class="headline">Welcome to the {{ taxonomy.suiteName }} {{ taxonomy.appLongName }} App!</v-card-title>
    <v-card-text>
      <blockquote class="blockquote mb-4">
        This app is actively under construction. Please stay tuned!
      </blockquote>

      <vue-markdown :breaks="true" table-class="vp-md-table">
## Getting Started
This app borrows many basic design ideas from *Microsoft Office 365*, making it very approachable and easy-to-use
for anyone familiar with that suite of cloud-based apps.

For example, the "waffle" menu in the upper left opens to a selection of "Applets" that represent the main modules
in this app, similar to the way that O365 provides a main navigation menu for accessing *Outlook*, *SharePoint*, etc.

### Concepts
Here's a table detailing the main concepts of this design.

| Term/Concept | &nbsp; | Description                                                                                                                      |
| :----------- | ------ | :------------------------------------------------------------------------------------------------------------------------------- |
| **Tenant**   |        | The name of the organization/domain for which this solution was created.                                                         |
|              |        | This is relevant mainly in a multi-tenant SaaS environment like O365 and is mentioned here for completeness.                     |
|              |        |                                                                                                                                  |
| **Suite**    |        | The name of the overall solution or family of apps to which this particular app belongs.                                         |
|              |        | In this case: **"{{ taxonomy.suiteName }}"**.                                                                                    |
|              |        |                                                                                                                                  |
| **App**      |        | The (mobile-friendly) website dedicated to a particular set of business functions (use-cases), and the name used to identify it. |
|              |        | In this case: **"{{ taxonomy.appLongName }}"** (aka **"{{ taxonomy.appName }}"**).                                               |
|              |        |                                                                                                                                  |
| **Applet**   |        | An individual module within the app implementing a set of related business functions.                                            |
|              |        | Typically an applet is used to View, Add, Edit, and Delete rows in an underlying database table.                                 |

### Keyboard Shortcuts
And here's a table detailing the keyboard shortcuts available in this app.

| Shortcut                      | Scope         | Description                                                                              |
| :---------------------------- | :------------ | :--------------------------------------------------------------------------------------- |
| **Shift + Home**              | Global        | Open the main app Home Page                                                              |
|                               |               |                                                                                          |
| **Shift + Enter**             | Global        | Toggle open/closed the "waffle" menu                                                     |
|                               |               |                                                                                          |
| **?** or **F1**               | "Waffle" menu | Briefly display all applet labels/tooltips                                               |
|                               |               |                                                                                          |
| (**2-letter** applet abbrev.) | "Waffle" menu | Pressing the 2-letter sequence (**lowercase**) for any applet opens the applet Home Page |

          </vue-markdown>

      <!--
          <hr class="my-3">

          <p class="text-sm-right">
            <v-icon>bug_report</v-icon>
            Find a bug? Report it on the GitHub
            <a href="https://github.com/vuepointjs/vuept/issues" target="_blank">issue board</a>.
          </p>
          -->
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  data: () => ({}),

  created() {
    console.log('COMP: Created <app-welcome-card>');
  },

  mounted() {
    console.log('COMP: Mounted <app-welcome-card>');
  },

  destroyed() {
    console.log('COMP: Destroyed <app-welcome-card>');
  },

  computed: {
    taxonomy() {
      return this.$store.state.ui.taxonomy;
    }
  }
};
</script>

<style lang="stylus">
.vp-md-table
  border-spacing: 10px 6px
</style>
