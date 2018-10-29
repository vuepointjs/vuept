'use strict';

// LoopBack boot script main entry point
module.exports = function(app) {
  console.log('Install Remote Hooks...');
  try {
    var remotes = app.remotes();

    // Optimization: set "X-Total-Count" header for all search requests for all models. This allows apps
    // to avoid a second API call (and associated network latency, etc.) simply to get the count
    remotes.after('*.find', function(ctx, next) {
      var filter;
      if (ctx.args && ctx.args.filter) {
        if (typeof ctx.args.filter === 'string' || ctx.args.filter instanceof String) filter = JSON.parse(ctx.args.filter).where;
        else filter = ctx.args.filter.where;
      }

      if (!ctx.res._headerSent) {
        this.count(filter, function(err, count) {
          ctx.res.set('X-Total-Count', count);
          next();
        });
      } else {
        next();
      }
    });
    console.log('Remote Hooks Installed.');
  } catch (e) {
    console.log(`>>> Error installing Remote Hooks: ${e}`);
  }
};
