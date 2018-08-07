/*
  See the following link for details on how to secure an API via Azure AD JWT Bearer Tokens:

    https://github.com/slathrop/jwt-azure-ad-bearer-example

  Also note that the /explorer page can be disabled by following the instructions here:

    https://loopback.io/doc/en/lb3/Preparing-for-deployment.html#disabling-api-explorer

  By default, the /explorer page remains enabled but the URL is obfuscated (with the App ID GUID)
  for enhanced security in PROD.

  And access to the actual endpoints and data requires a verified bearer token via either the access token
  qry str param or auth header.
*/
'use strict';
const jwt = require('jsonwebtoken');
const x5 = require('../ms-azure-ad-keys.json');

module.exports = function(app) {
  var Role = app.models.Role;

  Role.registerResolver('tenantUser', function(role, context, cb) {
    try {
      var nodeEnv = process.env.NODE_ENV;
      var bearerTokenStr = '';
      var tokenDecodeOptions = {
        complete: true
      };
      var decodedToken = {};
      var tokenVerifyOptions = {
        algorithms: ['RS256'],
        audience: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' // TODO: Pull Azure App ID from solution data
      };
      var verifiedToken = {};

      // console.log('>>>>> In tenantUser Role Resolver: %s (%s)', role, nodeEnv);

      // Allow all requests (disable security) in *development* environment only, unless FORCE_RBAC set to YES
      if (nodeEnv === 'development' && process.env.FORCE_RBAC != 'YES') return cb(null, true);

      // We have an auth header?
      var headers = context.remotingContext.req.headers;
      var authHeader = headers && headers['authorization'];
      if (authHeader) {
        // With two pieces beginning with "Bearer"?
        var authHeaderPieces = authHeader.split(' ');
        if (authHeaderPieces.length != 2) return cb(null, false);
        if (authHeaderPieces[0] != 'Bearer') return cb(null, false);

        // And a non-empty second piece?
        bearerTokenStr = authHeaderPieces[1];
        if (!bearerTokenStr) return cb(null, false);

        // console.log('>>>>>>>>>> Found Bearer Token in auth header');
        decodedToken = jwt.decode(bearerTokenStr, tokenDecodeOptions);
      } else {
        // We have an access_token as a query string parameter?
        bearerTokenStr = context.remotingContext.req.query.access_token;
        if (!bearerTokenStr) return cb(null, false);

        // console.log('>>>>>>>>>> Found Bearer Token in query string "access_token"');
        decodedToken = jwt.decode(bearerTokenStr, tokenDecodeOptions);
      }

      if (!decodedToken || !decodedToken.header) return cb(null, false);
      // console.log(decodedToken);

      var x5cString = x5.keyByThumbprint[decodedToken.header.x5t];
      var publicKey = '-----BEGIN CERTIFICATE-----\n' + x5cString + '\n-----END CERTIFICATE-----';

      // Verify bearer token and user (by email aka "user principle name" or UPN)
      try {
        verifiedToken = jwt.verify(bearerTokenStr, publicKey, tokenVerifyOptions);
        // console.log(verifiedToken);

        var email = verifiedToken.upn ? verifiedToken.upn.toLowerCase() : '';
        if (!email) return cb(null, false);

        var msTenantName = process.env.MS_TENANT_NAME ? process.env.MS_TENANT_NAME.toLowerCase() : '';
        if (!msTenantName) return cb(null, false);

        // See: https://support.office.com/en-us/article/domains-faq-1272bad0-4bd4-4796-8005-67d6fb3afc5a#bkmk_whydoihaveanonmicrosoft.comdomain
        // and: https://blog.lawrencecawood.com/heres-what-happens-when-you-pick-the-wrong-office-365-tenant-name-27b657e8acbd
        var msTenantDomain = `${msTenantName}.onmicrosoft.com`;

        var tenantPrimaryDomain = process.env.TENANT_PRIMARY_DOMAIN ? process.env.TENANT_PRIMARY_DOMAIN.toLowerCase() : '';
        if (!tenantPrimaryDomain) return cb(null, false);

        var isValidTenantUser = false;
        if (email.includes(`@${msTenantDomain}`)) isValidTenantUser = true;
        else if (email.includes(`@${tenantPrimaryDomain}`)) isValidTenantUser = true;

        if (!isValidTenantUser) return cb(null, false);
      } catch (e2) {
        console.log('>>>>>>>>>> Bearer Token verification failed.', e2);
        return cb(null, false);
      }
    } catch (e1) {
      console.log('>>>>>>>>>> Authorization header or Bearer Token parsing failed.', e1);
      return cb(null, false);
    }

    // If we got here, the user in the access token is a verified Tenant user
    return cb(null, true);

    // region User Lookup Note
    // TODO: We'll need to associate the email in the bearer token with a "user"
    //        in LoopBack to allow auditing of who did what
    //
    // Is the user logged in? (there will be an accessToken with an ID if so)
    // var userId = context.accessToken.userId;
    // if (!userId) {
    //   // A: No, user is NOT logged in: callback with FALSE
    //   return process.nextTick(() => cb(null, false));
    // }
    // endregion
  });

  console.log('Custom role resolver installed: tenantUser');
  // console.log('>>>>> keyByThumbprint', x5.keyByThumbprint);
};
