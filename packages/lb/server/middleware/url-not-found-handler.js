'use strict';
// console.log('\x1b[33m%s\x1b[0m', `>>> >>> BOOT: ${__filename}`);

const path = require('path');
const solutionRole = process.env.npm_package_config_vp_solution_role;
const suiteKey = process.env.npm_package_config_vp_suite_key;
const appKey = process.env.npm_package_config_vp_app_key || null;
const vpCtx = require('@vuept_solution/data').context.fromRoleAndKeys(solutionRole, suiteKey, appKey);

let clientPath = '';
if (vpCtx.isTemplateDev) {
  clientPath = path.join(__dirname, '../client');
} else {
  clientPath = path.join(vpCtx.apiSourcePath, 'client');
}

let spaRedirectOptions = {
  root: clientPath,
  dotfiles: 'deny',
  headers: {
    'x-timestamp': Date.now(),
    'x-sent': true
  }
};

module.exports = function() {
  console.log('Custom 404 middleware installed.');

  // For 4XX (URL not found) either:
  //   (1) Return an error related to serving one of the static JSON Models, or
  //   (2) Assume we are serving the client SPA folder which contains an app that does
  //       pushstate and requires that we serve the root index.html file
  //          See: https://expressjs.com/en/api.html#res.redirect
  //          and: https://www.netlify.com/docs/redirects/#history-pushstate-and-single-page-apps
  //          and: https://www.npmjs.com/package/express-history-api-fallback
  return function customUrlNotFoundHandler(req, res, next) {
    if (req.url.includes('/api/static')) {
      res.status(404).send('Model not found');
    } else {
      if ((req.method === 'GET' || req.method === 'HEAD') && req.accepts('html')) {
        res.sendFile('index.html', spaRedirectOptions, err => err && next());
      } else next();
    }
  };
};
