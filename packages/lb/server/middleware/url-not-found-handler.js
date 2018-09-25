'use strict';
// console.log('\x1b[33m%s\x1b[0m', `>>> >>> BOOT: ${__filename}`);

module.exports = function() {
  console.log('Custom 404 middleware installed.');

  // For 4XX (URL not found) assume we are serving a SPA that does pushstate and redirect to the root (index.html)
  // See: https://expressjs.com/en/api.html#res.redirect
  // and: https://www.netlify.com/docs/redirects/#history-pushstate-and-single-page-apps
  return function customRaiseUrlNotFoundError(req, res, next) {
    if (req.url.includes('/api/static')) {
      res.status(404).send('Model not found');
    } else {
      res.redirect(302, '/index.html');
    }
  };
};
