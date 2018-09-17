import AuthenticationContext from 'adal-angular/lib/adal.js';
import jwt from 'jsonwebtoken';

const authentication = {
  _config: null, // ADAL constructor config
  _context: null, // ADAL instance
  _useFakes: false,

  appToken: null, // The logged-in user's JWT token (if any) for the App. Retrieved via ADAL based on "clientId" in supplied config
  apiToken: null, // The logged-in user's JWT token (if any) for API access. Retrieved via ADAL based on "apiId" in supplied config
  userRoles: [], // An array of the logged-in user's assigned roles (if any) from the set of API roles

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
      console.log(`AUTH: >>> ADAL already ${useFakes ? '(fake) ' : ''}initialized. Ignoring initialize call`);
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

    // Handle API authentication errors by (re-) acquiring the pass-thru token and adding it to the default headers
    try {
      axios.interceptors.response.use(undefined, err => {
        if (err.response.status === 401 && err.response.config && !err.response.config.__isRetryRequest) {
          err.response.config.__isRetryRequest = true;

          return new Promise((resolve, reject) => {
            acquireApiToken().then(token => {
              axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
              err.config.headers.Authorization = `Bearer ${token}`;

              axios(err.config).then(resolve, reject);
            });
          });
        }
        throw err;
      });
      console.log('AUTH: configured Axios interceptor to send API access token');
    } catch (e1) {
      console.log('AUTH: failed to configure Axios interceptor to send API access token');
    }

    return new Promise((resolve, reject) => {
      try {
        var isAuthCallback = this._context.isCallback(window.location.hash);
        var isMainWindow = window.self === window.top;
        var user = null;

        if (isAuthCallback || !isMainWindow) {
          console.log('AUTH: >>> Performing Auth Callback via ADAL...');
          // Redirect to the location specified in the url params
          this._context.handleWindowCallback();
        } else {
          // Try to pull the user out of local storage
          user = this._context.getCachedUser();

          if (user) {
            // Great, we have a user
            resolve();
          } else {
            // No user, kick off the sign-in flow
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

    console.log('AUTH: Calling ADAL "getCachedToken()"...');

    // getCachedToken will only return a valid, non-expired token
    this.appToken = this._context.getCachedToken(this._config.clientId);
    if (this.appToken) {
      console.log('AUTH: Acquire App Token Succeeded');
      return true;
    }

    console.log('AUTH: Acquire App Token Failed');
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
        name: fakeUpn,
        upn: fakeUpn,
        email: fakeUpn
      };
    }

    return this._context.getCachedUser().profile;
  },

  signIn() {
    if (this._useFakes) return;
    this._context.login();
  },

  signOut() {
    if (this._useFakes) return;
    this._context.logOut();
  }
};

/**
 * @return {Promise.<String>} A promise that resolves to an ADAL token for API access
 */
function acquireApiToken() {
  authentication.apiToken = null;
  authentication.userRoles = [];

  return new Promise((resolve, reject) => {
    if (this._useFakes) {
      console.log('AUTH: Acquire (fake) API Token Succeeded');
      token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      authentication.apiToken = token;
      authentication.userRoles = userRolesFromApiToken();
      return resolve(token);
    }

    authentication._context.acquireToken(authentication._config.apiId, (errDescription, token, err) => {
      if (errDescription || !token) {
        var msg = `AUTH: Acquire API Token Failed: ${errDescription} [${err}]`;
        console.log(msg);
        return reject(msg);
      } else {
        console.log('AUTH: Acquire API Token Succeeded');
        authentication.apiToken = token;
        authentication.userRoles = userRolesFromApiToken();
        return resolve(token);
      }
    });
  });
}

/**
 * @return {Array} An array with the user's roles found in the apiToken
 */
function userRolesFromApiToken() {
  if (this._useFakes) {
    return ['FakeRoleA', 'FakeRoleB'];
  }

  try {
    var decodedToken = jwt.decode(authentication.apiToken);
    var roles = decodedToken.roles || [];
    console.log(`AUTH: User roles... ${JSON.stringify(roles, null, 2)}`);
    return roles;
  } catch (e) {
    console.log('AUTH: Error reading API Token', e);
  }
}

export default authentication;
