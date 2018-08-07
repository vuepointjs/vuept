'use strict';

module.exports = function() {
  console.log('Custom "URL not found" middleware installed.');

  // For 4XX (URLs not found) assume we are serving a SPA that does pushstate and redirect to the root (index.html)
  // See: https://expressjs.com/en/api.html#res.redirect
  // and: https://www.netlify.com/docs/redirects/#history-pushstate-and-single-page-apps
  return function customRaiseUrlNotFoundError(req, res, next) {
    res.redirect(302, '/index.html');
  };
};
