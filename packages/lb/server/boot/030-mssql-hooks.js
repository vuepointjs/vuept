'use strict';
console.log('\x1b[33m%s\x1b[0m', `>>> >>> BOOT: ${__filename}`);

// const bb = require('bluebird');
// const vp = require('../vp');

// LoopBack boot script main entry point
module.exports = async function(app) {
  console.log('Install MSSQL Connector Hooks...');
  try {
    const ds = app.dataSources.db;
    const conn = ds.connector;

    // const asyncNowSuffix = { suffix: 'Now' };
    // bb.promisifyAll(ds, asyncNowSuffix);
    // bb.promisifyAll(conn, asyncNowSuffix);

    conn.observe('before execute', function(ctx, next) {
      // console.log('>>> MSSQL *BEFORE* Hook');
      // console.dir(ctx);

      // let oldSQL = ctx.req.sql;
      // let newSQL = oldSQL;

      // if (oldSQL.includes('FROM [dbo].[Party]')) {
      //   newSQL = oldSQL.replace('] FROM', '],[ValidFrom] FROM');
      // }

      // ctx.req.sql = newSQL;
      next();
    });

    conn.observe('after execute', function(ctx, next) {
      // console.log('>>> MSSQL *AFTER* Hook');
      // console.dir(ctx);
      // console.dir(ctx.results);
      next();
    });

    console.log('MSSQL Connector Hooks Installed.');
  } catch (e) {
    console.log(`>>> Error installing MSSQL Connector Hooks: ${e}`);
  }
};
