/**
 * model.js: VP data model helpers
 */
import Vue from 'vue';
// import '@vuept_template/solution-api/common/models';
// import '@vuept_solution/api-ZZ/common/models';

// Nuxt plugin bootup - main entry point
export default (ctx, inject) => {
  // Install "$model" as a Vue + Nuxt plugin (e.g., ctx.app.$model, this.$model in components and store)
  inject(
    'model',
    new Vue({
      data: () => ({}),

      created() {
        console.log('PI: $model vue instance created');
      },

      methods: {}
    })
  );

  console.log('PI: $model installed');
};
