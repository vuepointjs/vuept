'use strict';
// console.log('\x1b[33m%s\x1b[0m', `>>> >>> BOOT: ${__filename}`);

const bb = require('bluebird');
const vp = require('../vp');

let MIGRATION_STRATEGY = 'none';

// Optionally (based on env var) set DB schema migration strategy to something other than the default 'none'
let schemaStrategyVar = process.env.SCHEMA_STRATEGY;
if (schemaStrategyVar) {
  schemaStrategyVar = schemaStrategyVar.toLowerCase();
  if (['preserve_data', 'force', 'force_no_auditing'].includes(schemaStrategyVar)) {
    console.log(`Schema migration strategy changed from '${MIGRATION_STRATEGY}' to '${schemaStrategyVar}'.`);
    MIGRATION_STRATEGY = schemaStrategyVar;
  }
}

// Optionally end the LoopBack bootup sequence and LoopBack process after schema migrations
let isSchemaOnly = process.env.SCHEMA_ONLY;

// LoopBack boot script main entry point
module.exports = async function(app) {
  console.log('Prepare to process any schema migrations...');
  try {
    const ds = app.dataSources.db;
    const schema = ds.settings.schema;
    const conn = ds.connector;
    const asyncNowSuffix = { suffix: 'Now' };
    bb.promisifyAll(ds, asyncNowSuffix);
    bb.promisifyAll(conn, asyncNowSuffix);

    if (MIGRATION_STRATEGY === 'none') {
      console.log(`Skipped schema migrations for ${ds.settings.database} on ${ds.settings.server}.`);
      return;
    }

    console.log(`Running schema migrations/changes against ${ds.settings.database} on ${ds.settings.server}...`);

    await vp.DataAuditing.drop(app, conn, schema, MIGRATION_STRATEGY);
    await vp.ForeignKeys.drop(app, conn, schema);

    // TODO: Consider adding a MigrationStrategy option 'drop_only' and
    // loop through all models calling conn.dropTable(model), then ending this fxn here

    // automigrate() forces tables to be dropped and re-created. But autoupdate() alters tables, preserving data. Choose wisely!
    // NOTE: automigrate() drops tables in the order that they are listed in the model-config.json file, so order them correctly
    // based on foreign key relationships
    if (MIGRATION_STRATEGY === 'force' || MIGRATION_STRATEGY === 'force_no_auditing') await ds.automigrateNow();
    if (MIGRATION_STRATEGY === 'preserve_data') {
      await ds.autoupdateNow();
      console.log('>>> Note that any schema migration error messages involving failure to drop "ValidFrom" can be ignored.');
      console.log('>>> "ValidFrom" is not part of the LoopBack model but must be present for data auditing.');
    }

    await vp.ForeignKeys.add(app, conn, schema);
    if (MIGRATION_STRATEGY != 'force_no_auditing') await vp.DataAuditing.add(app, conn, schema, MIGRATION_STRATEGY);

    console.log('>>> Schema migrations completed.');
  } catch (e) {
    console.log(`>>> Error running schema migrations: ${e}`);
  }

  // If boot schema only option was set, we're finished
  if (isSchemaOnly) process.exit(0);
};
