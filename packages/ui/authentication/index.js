import AuthenticationContext from 'adal-angular/lib/adal.js';
import jwt from 'jsonwebtoken';

const authentication = {
  _config: null, // ADAL constructor config
  _context: null, // ADAL instance

  appToken: null, // The logged-in user's JWT token (if any) for the App. Retrieved via ADAL based on "clientId" in supplied config
  apiToken: null, // The logged-in user's JWT token (if any) for API access. Retrieved via ADAL based on "apiId" in supplied config
  userRoles: [], // An array of the logged-in user's assigned roles (if any) from the set of API roles

  /**
   * @param {Object} config Authentication configuration object: see MS ADAL constructor docs here:
   * https://github.com/AzureAD/azure-activedirectory-library-for-js#usage
   * Typically you'd define "tenant", "clientId", and "redirectUri". We also support "apiId"
   * @param {Boolean} [enableVerboseLogging=false] When supplied and set to true, console.log verbose ADAL messages
   * @return {Promise}
   */
  initialize(config, enableVerboseLogging) {
    // Do nothing if we already initialized ADAL
    if (this._context) {
      console.log('>>> ADAL already initialized. Ignoring additional initialize call');
      return new Promise((resolve, reject) => {
        resolve();
      });
    }

    console.log('Initializing ADAL authentication...');
    enableVerboseLogging = !!enableVerboseLogging;
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
      console.log('Axios: configured interceptor to send API access token');
    } catch (e1) {
      console.log('Axios: failed to configure interceptor to send API access token');
    }

    return new Promise((resolve, reject) => {
      try {
        var isAuthCallback = this._context.isCallback(window.location.hash);
        var isMainWindow = window.self === window.top;
        var user = null;

        if (isAuthCallback || !isMainWindow) {
          console.log('>>> Performing Auth Callback via ADAL...');
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
        console.log('ADAL initialization error:', e2);
      }
    });
  },

  /**
   * @return {Boolean} Indicates if there is a valid, non-expired access token present in localStorage
   */
  isAuthenticated() {
    console.log('Calling ADAL "getCachedToken()"...');

    // getCachedToken will only return a valid, non-expired token
    this.appToken = this._context.getCachedToken(this._config.clientId);
    if (this.appToken) {
      console.log('Acquire App Token Succeeded');
      return true;
    }

    console.log('Acquire App Token Failed');
    return false;
  },

  /**
   * @return An ADAL user profile object
   */
  getUserProfile() {
    return this._context.getCachedUser().profile;
  },

  signIn() {
    this._context.login();
  },

  signOut() {
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
    authentication._context.acquireToken(authentication._config.apiId, (errDescription, token, err) => {
      if (errDescription || !token) {
        var msg = `Acquire API Token Failed: ${errDescription} [${err}]`;
        console.log(msg);
        return reject(msg);
      } else {
        console.log('Acquire API Token Succeeded');
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
  try {
    var decodedToken = jwt.decode(authentication.apiToken);
    var roles = decodedToken.roles || [];
    console.log(`User roles: ${JSON.stringify(roles)}`);
    return roles;
  } catch (e) {
    console.log('Error reading Api Token', e);
  }
}

export default authentication;
