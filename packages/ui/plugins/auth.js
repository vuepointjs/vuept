/**
 * auth.js: Authentication plugin using JWT and ADAL
 */
import Vue from 'vue';
import _ from 'lodash';
import AuthenticationContext from 'adal-angular/lib/adal.js';
import jwt from 'jsonwebtoken';

const vpCtx = process.env.vpCtx;
const useFakeAuth = vpCtx.isTemplateDev && !vpCtx.isForceRBAC;
const azureProfileKey = vpCtx.isNodeDev ? 'DEV' : 'PROD';
const azureData = _(vpCtx.suiteData.azure)
  .filter({ key: azureProfileKey })
  .first();

let msTenantDomain = azureData.tenant;
let tenantPrimaryDomain = vpCtx.suiteData.tenantPrimaryDomain;

// console.log('In $auth plugin...');
// console.log(`vpCtx: ${JSON.stringify(vpCtx, null, 2)}`);
// console.log(`suiteData: ${JSON.stringify(suiteData, null, 2)}`);
// console.log(`azureData: ${JSON.stringify(azureData, null, 2)}`);

// Nuxt plugin bootup - main entry point
export default (ctx, inject) => {
  // Install "$auth" as a Vue + Nuxt plugin (e.g., ctx.app.$auth, this.$auth in components and store)
  inject(
    'auth',
    new Vue({
      data: () => ({
        _config: null, // ADAL constructor config
        _context: null, // ADAL instance
        _useFakes: false,

        appToken: null, // The logged-in user's JWT token (if any) for the App. Retrieved via ADAL based on "clientId" in supplied config
        apiToken: null, // The logged-in user's JWT token (if any) for API access. Retrieved via ADAL based on "apiId" in supplied config
        userRoles: [], // An array of the logged-in user's assigned roles (if any) from the set of API roles

        userFullName: '',
        userEmail: '',
        userName: ''
      }),

      async created() {
        console.log('PI: $auth vue instance created');

        await this.initialize(azureData, useFakeAuth, vpCtx.isVerbose);
      },

      methods: {
        /**
         * @param {Object} config Authentication configuration object: see MS ADAL constructor docs here:
         * https://github.com/AzureAD/azure-activedirectory-library-for-js#usage
         * Typically you'd define "tenant", "clientId", and "redirectUri". We also support "apiId"
         * @param {Boolean} [useFakes=false] When supplied and set to true, don't authenticate or use ADAL, instead fake authentication
         * @param {Boolean} [enableVerboseLogging=false] When supplied and set to true, console.log verbose ADAL messages. Ignored when useFakes=true
         * @return {Promise}
         */
        initialize(config, useFakes, enableVerboseLogging) {
          this._useFakes = !!useFakes;
          enableVerboseLogging = !!enableVerboseLogging;

          // Do nothing if we already initialized ADAL or we're configured to use fakes
          if (this._context || this._useFakes) {
            console.log(`AUTH: >>> ADAL ${useFakes ? '(fake)' : 'already'} initialized. Ignoring initialize call`);
            return new Promise((resolve, reject) => {
              resolve();
            });
          }

          console.log('AUTH: Initializing ADAL authentication...');

          this._config = config;
          this._context = new AuthenticationContext(this._config);

          if (enableVerboseLogging) {
            window.Logging = {
              level: this._context.CONSTANTS.LOGGING_LEVEL.VERBOSE,
              log: console.log
            };
          }

          let vm = this;

          // Handle API authentication errors by re-acquiring the pass-thru token and adding it to the default headers
          try {
            ctx.$axios.interceptors.response.use(undefined, err => {
              if (err.response.status === 401 && err.response.config && !err.response.config.__isRetryRequest) {
                err.response.config.__isRetryRequest = true;

                return new Promise((resolve, reject) => {
                  vm.acquireApiToken(true).then(token => {
                    err.config.headers.Authorization = `Bearer ${token}`;
                    ctx.$axios(err.config).then(resolve, reject);
                  });
                });
              }
              throw err;
            });
            // console.log('AUTH: configured axios interceptor to re-acquire and send API access token on error');
          } catch (e1) {
            console.log('AUTH: failed to configure axios error interceptor');
          }

          return new Promise((resolve, reject) => {
            try {
              let isAuthCallback = vm._context.isCallback(window.location.hash);
              let isMainWindow = window.self === window.top;
              let user = null;

              if (isAuthCallback || !isMainWindow) {
                console.log('AUTH: >>> Performing Auth Callback via ADAL...');
                // Redirect to the location specified in the url params
                vm._context.handleWindowCallback();
              } else {
                // Try to pull the user out of local storage
                user = vm._context.getCachedUser();

                if (user) {
                  // Great, we have a user
                  console.log('AUTH: >>> found cached user during initialization');
                  resolve();
                } else {
                  // No user, kick off the sign-in flow
                  console.log('AUTH: >>> no cached user at initialization, performing sign-in');
                  this.signIn();
                }
              }
            } catch (e2) {
              console.log('AUTH: ADAL initialization error:', e2);
            }
          });
        },

        /**
         * @return {Boolean} Indicates if there is a valid, non-expired access token present in localStorage
         */
        isAuthenticated() {
          if (this._useFakes) {
            console.log('AUTH: isAuthenticated() faked as true');
            return true;
          }

          // console.log('AUTH: Calling ADAL "getCachedToken()"...');

          // getCachedToken will only return a valid, non-expired token
          this.appToken = this._context.getCachedToken(this._config.clientId);
          if (this.appToken) {
            console.log('AUTH: Acquire App Token Succeeded');
            return true;
          }

          console.log('AUTH: Acquire App Token Failed');
          this.clearUserProfile();
          return false;
        },

        /**
         * @return An ADAL user profile object
         */
        getUserProfile() {
          if (this._useFakes) {
            console.log('AUTH: getUserProfile() faked');
            const fakeUpn = 'fake.user@example.com';
            return {
              name: 'Fake User',
              upn: fakeUpn,
              email: fakeUpn
            };
          }

          let user = this._context.getCachedUser();
          return user ? user.profile : {};
        },

        parseUserProfile(userProfile) {
          this.userFullName = userProfile.name;
          this.userEmail = userProfile.upn;
          this.userName = userProfile.upn && userProfile.upn.split('@')[0];
          // console.log('AUTH: Parsed user profile'); //, ctx.app.$helpers.stringifyObj(userProfile));
        },

        isTenantUser() {
          if (this._useFakes) {
            console.log('AUTH: isTenantUser() faked');
            return true;
          }

          let email = this.userEmail ? this.userEmail.toLowerCase() : '';
          if (!email) return false;
          if (!msTenantDomain) false;

          msTenantDomain = msTenantDomain.toLowerCase();
          if (!msTenantDomain.includes('.onmicrosoft.com')) return false;

          if (!tenantPrimaryDomain) return false;
          tenantPrimaryDomain = tenantPrimaryDomain.toLowerCase();

          if (email.includes(`@${msTenantDomain}`)) return true;
          else if (email.includes(`@${tenantPrimaryDomain}`)) return true;

          return false;
        },

        clearUserProfile() {
          this.userFullName = this.userEmail = this.userName = this.apiToken = '';
          this.userRoles = [];
        },

        signIn() {
          if (this._useFakes) return;
          this._context.login();
        },

        signOut() {
          if (this._useFakes) return;
          this._context.clearCacheForResource(this._config.apiId);
          this._context.clearCacheForResource(this._config.clientId);
          this.clearUserProfile();
          this._context.logOut();
        },

        /**
         * Perform auth checks and cache user profile info and API token if possible. If auth
         * checks fail, perform sign-out
         */
        async check() {
          if (this._useFakes) {
            this.isAuthenticated();
            this.parseUserProfile(this.getUserProfile());
            this.isTenantUser();
            await this.acquireApiToken();
            console.log('AUTH: auth checks (fake) passed');
            return;
          }

          if (this._context.loginInProgress()) {
            console.log('AUTH: auth checks skipped while login in progress');
            return;
          }

          let passedAuthChecks = false;

          try {
            if (this.isAuthenticated()) {
              this.parseUserProfile(this.getUserProfile());

              if (this.isTenantUser()) {
                await this.acquireApiToken();
                passedAuthChecks = true;
              } else {
                console.log('AUTH: user not a tenant user, logging out...');
              }
            }
          } catch (e) {
            console.log('AUTH: error checking auth', e);
          }

          if (passedAuthChecks) {
            console.log('AUTH: auth checks passed');
          } else {
            console.log('AUTH: auth checks failed');
            this.signOut();
          }
        },

        /**
         * Acquire a token for calling the app's associated REST API and return it, or return the already-cached token
         * @param {Boolean} force [force=false] When supplied and set to true, (re-)acquire the token even if one is cached
         * @returns {Promise.<String>} A promise that resolves to an ADAL token for API access
         */
        acquireApiToken(force) {
          force = !!force;

          let vm = this;

          if (this.apiToken && !force) {
            console.log('AUTH: Acquire API Token Succeeded... With Cached Token');
            return new Promise((resolve, reject) => resolve(vm.apiToken));
          }

          this.apiToken = null;
          this.userRoles = [];

          return new Promise((resolve, reject) => {
            if (vm._useFakes) {
              let token =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
                'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
                'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
              vm.apiToken = token;
              vm.userRoles = vm.userRolesFromApiToken();
              console.log('AUTH: Acquire (fake) API Token Succeeded');
              ctx.$axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
              // console.log('AUTH: Configured axios default header to send API access token');
              return resolve(token);
            }

            vm._context.acquireToken(vm._config.apiId, (errDescription, token, err) => {
              if (errDescription || !token) {
                let msg = `AUTH: Acquire API Token Failed: ${errDescription} [${err}]`;
                console.log(msg);
                return reject(msg);
              } else {
                vm.apiToken = token;
                vm.userRoles = vm.userRolesFromApiToken();
                console.log('AUTH: Acquire new API Token Succeeded');
                ctx.$axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                // console.log('AUTH: Configured axios default header to send API access token');
                return resolve(token);
              }
            });
          });
        },

        /**
         * @return {Array} An array with the user's roles found in the apiToken
         */
        userRolesFromApiToken() {
          if (this._useFakes) {
            return ['FakeRoleA', 'FakeRoleB'];
          }

          try {
            let decodedToken = jwt.decode(this.apiToken);
            let roles = decodedToken.roles || [];
            // console.log('AUTH: Read user roles from API token'); //, ctx.app.$helpers.stringifyObj(roles));
            return roles;
          } catch (e) {
            console.log('AUTH: Error reading API Token', e);
          }
        }
      }
    })
  );

  console.log('PI: $auth installed');
};
