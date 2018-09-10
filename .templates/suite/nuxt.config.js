const pkg = require('./package');
const app = require('./app.config');
const scenario = app.SCENARIO_KEY.toLowerCase();
const taxonomy = require(`./store/ui.taxonomy.${scenario}.base`);
const nodeExternals = require('webpack-node-externals');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const solutionRole = process.env.npm_package_config_vp_solution_role;
const suiteKey = process.env.npm_package_config_vp_suite_key;
const appKey = process.env.npm_package_config_vp_app_key || null;
const vpCtx = require('@vuept_solution/data').context.fromRoleAndKeys(solutionRole, suiteKey, appKey);

// Tweak Nuxt runtime config during template development
if (vpCtx.isTemplateDev) {
  process.env.PORT = vpCtx.port;
}

// Optionally (based on env var) end the nuxt build process after simply displaying some basic information
if (vpCtx.isInfoOnly) {
  // Show some basic info and we're finished
  console.log('----------');
  console.dir(vpCtx, {
    depth: vpCtx.isVerbose ? 2 : 0
  });
  console.log('>>> Terminating nuxt build process due to INFO_ONLY flag.');
  process.exit(0);
}

module.exports = {
  mode: 'spa',
  rootDir: vpCtx.isTemplateDev ? '../../' : '../../../',
  srcDir: vpCtx.sourcePath,
  buildDir: vpCtx.buildDir,

  env: vpCtx,

  /*
   ** Headers of the page
   */
  head: {
    title: vpCtx.title, // taxonomy.appName, // pkg.description,
    meta: [
      {
        charset: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        hid: 'description',
        name: 'description',
        content: vpCtx.description // pkg.description
      }
    ],
    link: [
      // {
      //   rel: 'preconnect',
      //   href: 'https://api.????.com'
      // },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com'
      },
      // {
      //   rel: 'icon',
      //   type: 'image/jpg',
      //   href: '/favicon-32x32.jpg'
      // },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons'
      }
    ]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: {
    color: '#ffcc80' // orange lighten-3
  },

  /*
   ** Global CSS
   */
  css: ['assets/main.styl'],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '@/plugins/vuetify',
    '@/plugins/vue-markdown',
    { src: '@/plugins/vue-chartjs', ssr: false },
    { src: '@/plugins/helpers', ssr: false },
    { src: '@/plugins/mousetrap', ssr: false }
  ],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios'
  ],
  /*
   ** Axios module configuration
   */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  // Call out dynamic routes for rendering during "nuxt generate"
  generate: {
    dir: `${vpCtx.buildDir}-dist`,
    routes: []
  },

  /*
   ** Build configuration
   */
  build: {
    vendor: [
      'babel-polyfill', // Required for IE11 support
      'numeral',
      'vue-markdown',
      'lodash',
      'luxon'
    ],

    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      if (ctx.isDev && ctx.isClient) {
        config.devtool = '#source-map';
      }

      if (ctx.isServer) {
        config.externals = [
          nodeExternals({
            whitelist: [/^vuetify/]
          })
        ];
      }

      // Uglify and strip console.log in production
      if (!ctx.isDev) {
        config.plugins.push(
          new UglifyJsPlugin({
            uglifyOptions: {
              compress: {
                drop_console: true
              }
            }
          })
        );
      }

      const vueLoaderConfig = config.module.rules.find(el => el.loader === 'vue-loader').options;
      vueLoaderConfig.loaders.docs = require.resolve('./webpack/docs-loader.js');
      // console.log('vue-loader options...');
      // console.log(vueLoaderConfig.loaders);
    }
  }
};
