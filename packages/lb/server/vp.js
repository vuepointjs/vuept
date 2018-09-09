// VuePoint.js LoopBack customizations

'use strict';
console.log('\x1b[33m%s\x1b[0m', `>>> >>> BOOT: ${__filename}`);

const SQL_BATCH_DELIMITER = 'GO;';

/**
 * LoopBack 3.x supports modeling FK relationships and will honor those relationships
 * when performing API methods. However, the SQL Server data source for LB does not actually
 * issue DDL commands to create FK constraints in the database. So we provide this
 * implementation to construct the DDL and drop/add FKs.
 */
const ForeignKeys = {
  ddlScript: { dropFKs: '', addFKs: '' },

  /**
   * Drop any existing FKs (specified in model json files under _vp... foreignKeys) so that
   * referenced tables can be dropped by automigrate(), if applicable
   * @param {object} app The LoopBack app
   * @param {object} conn LoopBack data source connector for SQL Server
   * @param {string} schema The name of the schema (e.g., 'dbo') used to scope the database tables/views
   */
  async drop(app, conn, schema) {
    if (!this.ddlScript.dropFKs) this.buildDDL(app, schema);

    console.log('Foreign Key Constraints: executing drop scripts...\n');
    await executeSqlInBatches(conn, this.ddlScript.dropFKs);
    console.log('Foreign Key Constraints: drop script execution completed.\n');
  },

  /**
   * Add (back) FKs (specified in model json files under _vp... foreignKeys)
   * @param {object} app The LoopBack app
   * @param {object} conn LoopBack data source connector for SQL Server
   * @param {string} schema The name of the schema (e.g., 'dbo') used to scope the database tables/views
   */
  async add(app, conn, schema) {
    if (!this.ddlScript.addFKs) this.buildDDL(app, schema);

    console.log('Foreign Key Constraints: executing add scripts...\n');
    await executeSqlInBatches(conn, this.ddlScript.addFKs);
    console.log('Foreign Key Constraints: add script execution completed.\n');
  },

  buildDDL(app, schema) {
    console.log('Foreign Key Constraints: building DDL scripts...');

    // Iterate over all FK specs...
    forEachSpec(app, 'foreignKeys', (modelName, model, spec) => {
      // ...any properties/columns found in this spec?
      if (Object.keys(spec).length > 0) {
        // If so, append each one to the DDL scripts
        Object.keys(spec).forEach(fkColName => {
          let fk = spec[fkColName];
          this.ddlScript.dropFKs += `
            if (object_id(N'[${schema}].[${fk.constraint}]', N'F') is not null)
            begin
              alter table [${schema}].[${modelName}] drop constraint ${fk.constraint}
            end
            ${SQL_BATCH_DELIMITER}
          `;
          this.ddlScript.addFKs += `
            if (object_id(N'[${schema}].[${fk.constraint}]', N'F') is null)
            begin
              alter table [${schema}].[${modelName}] add constraint ${fk.constraint} foreign key (${fkColName}) references [${schema}].[${fk.referencesTable}] (${
            fk.referencesColumn
          })
            end
            ${SQL_BATCH_DELIMITER}
          `;
        });
      }
    });

    console.log('Foreign Key Constraints: DDL scripts built.');
  }
};

/**
 * LoopBack supports validations on individual model properties. Use this object
 * to apply them based on custom model properties
 */
const ModelPropValidations = {
  /**
   * Add all VuePoint.js custom model property validations
   * @param app The LoopBack app to which we're adding the validations
   */
  add(app) {
    forEachSpec(app, 'validations', (modelName, model, spec) => {
      // Setup any "oneOf" (property enum/domain) validations
      if (spec.oneOf) {
        let oneOfValidations = spec.oneOf;
        Object.keys(oneOfValidations).forEach(propName => {
          let { values, legend, allowNull } = oneOfValidations[propName];
          allowNull = allowNull === true ? true : false; // allowNull defaults to false

          // Give LoopBack the validation info for the model and property
          model.validatesInclusionOf(propName, {
            in: values,
            message: `${allowNull ? 'may be omitted or explicitly set to null, but otherwise ' : ''}must be one of: ${values.toString()} (i.e., ${legend})`,
            allowNull
          });

          // console.log(`Custom validation: ${modelName}.${propName} ${allowNull ? 'may be omitted or explicitly set to null, but otherwise ' : ''}must be one of ${JSON.stringify(values)} (${legend})`);
        });
      }
    });
  }
};

/**
 * Scope for managing SQL Server Temporal Table (TT) data auditing features as part of
 * LoopBack schema migrations
 */
const DataAuditing = {
  ddlScript: { dropTTs: '', addTTs: '' },

  /**
   * Drop any existing temporal table (TT) elements (if specified in model json files under _vp... dataAuditing)
   * so that referenced tables can be dropped by automigrate(), if applicable
   * @param {object} app The LoopBack app
   * @param {object} conn LoopBack data source connector for SQL Server
   * @param {string} schema The name of the schema (e.g., 'dbo') used to scope the database tables/views
   * @param {string} strategy The name of the schema migration strategy being used (e.g., 'force or 'preserve_data')
   */
  async drop(app, conn, schema, strategy) {
    if (!this.ddlScript.dropTTs) this.buildDDL(app, schema, strategy);

    console.log('Data Auditing (Temporal Tables): executing drop scripts...\n');
    await executeSqlInBatches(conn, this.ddlScript.dropTTs);
    console.log('Data Auditing (Temporal Tables): drop script execution completed.\n');
  },

  /**
   * Add (back) temporal table (TT) elements
   * @param {object} app The LoopBack app
   * @param {object} conn LoopBack data source connector for SQL Server
   * @param {string} schema The name of the schema (e.g., 'dbo') used to scope the database tables/views
   * @param {string} strategy The name of the schema migration strategy being used (e.g., 'force or 'preserve_data')
   */
  async add(app, conn, schema, strategy) {
    if (!this.ddlScript.addTTs) this.buildDDL(app, schema, strategy);

    console.log('Data Auditing (Temporal Tables): executing add scripts...\n');
    await executeSqlInBatches(conn, this.ddlScript.addTTs);
    console.log('Data Auditing (Temporal Tables): add script execution completed.\n');
  },

  buildDDL(app, schema, strategy) {
    console.log('Data Auditing (Temporal Tables): building DDL scripts...');

    // Iterate over all model TT options...
    forEachSpec(app, 'dataAuditing', (modelName, model, spec) => {
      // ...any options found?
      if (spec.options) {
        // If so, append this model's TT DDL script (if TT is enabled for this model)
        if (spec.options.enabled) {
          this.ddlScript.dropTTs += `
            if (2 = (select temporal_type from sys.tables where object_id = object_id(N'[${schema}].[${modelName}]', N'U')))
            begin
              alter table [${schema}].[${modelName}] set (system_versioning = off)
              alter table [${schema}].[${modelName}] drop period for system_time
            end
            ${SQL_BATCH_DELIMITER}

            if (object_id(N'[${schema}].[DF_${modelName}_ValidFrom]', N'D') is not null)
            begin
              alter table [${schema}].[${modelName}] drop constraint DF_${modelName}_ValidFrom
              alter table [${schema}].[${modelName}] drop column ValidFrom
            end
            ${SQL_BATCH_DELIMITER}

            if (object_id(N'[${schema}].[DF_${modelName}_ValidTo]', N'D') is not null)
            begin
              alter table [${schema}].[${modelName}] drop constraint DF_${modelName}_ValidTo
              alter table [${schema}].[${modelName}] drop column ValidTo
            end
            ${SQL_BATCH_DELIMITER}
          `;

          /*
            TODO: Determine if schema changes (e.g., added columns) will be reflected in History
            tables if History tables are *not* dropped (to preserve audit trail data) but instead
            system_versioning is simply turned back on in "add"

            TODO: Consider supporting change in dataAuditing "enabled" value from say true to false
          */

          // Drop the history table when forcing schema refresh
          if (strategy === 'force' || strategy === 'force_no_auditing') {
            this.ddlScript.dropTTs += `
              if (object_id(N'[${schema}].[${modelName}History]', N'U')) is not null
              begin
                drop table [${schema}].[${modelName}History]
              end
              ${SQL_BATCH_DELIMITER}
            `;
          }

          this.ddlScript.addTTs += `
            alter table [${schema}].[${modelName}]
            add
                ValidFrom datetime2 (0) GENERATED ALWAYS AS ROW START HIDDEN
                    constraint DF_${modelName}_ValidFrom DEFAULT DATEADD(SECOND, -1, SYSUTCDATETIME()),
                ValidTo datetime2 (0)  GENERATED ALWAYS AS ROW END HIDDEN
                    constraint DF_${modelName}_ValidTo DEFAULT '9999.12.31 23:59:59.99',
                PERIOD FOR SYSTEM_TIME (ValidFrom, ValidTo);
            ${SQL_BATCH_DELIMITER}

            alter table [${schema}].[${modelName}]
            set (SYSTEM_VERSIONING = ON (HISTORY_TABLE = [${schema}].[${modelName}History]));
            ${SQL_BATCH_DELIMITER}
          `;
        }
      }
    });

    console.log('Data Auditing (Temporal Tables): DDL scripts built.');
  }
};

// #region Helper Functions
/**
 * Execute a provided callback function once for every custom model spec
 * of the type indicated (i.e., validations, FKs)
 * @param app The LoopBack app
 * @param specType The type of spec the caller wishes to iterate over
 * @param cb The callback
 */
function forEachSpec(app, specType, cb) {
  let models = app.models;
  console.log(`Iterate over model ${specType}...`);

  try {
    // For each model...
    Object.keys(models).forEach(function(modelName) {
      let model = app.models[modelName];
      let dpModelCustomSpecs = model.settings._vp;

      // ...if it has the right VuePoint.js (_vp) custom specs defined, then execute callback
      if (dpModelCustomSpecs && dpModelCustomSpecs[specType]) {
        let modelSpec = dpModelCustomSpecs[specType];
        cb(modelName, model, modelSpec);
      }
    });
    console.log(`Completed iteration over model ${specType}.`);
  } catch (e) {
    console.log('Error iterating over custom model validations:', e);
  }
}

/**
 * Execute a sql script on a given DB connection, but split the execution into
 * individual batches based on SQL_BATCH_DELIMITER delimiters that appear in the script
 * @param conn The DB connection
 * @param sql The sql script with at least one SQL_BATCH_DELIMITER delimiter
 */
async function executeSqlInBatches(conn, sql) {
  let batches = sql.split(SQL_BATCH_DELIMITER);

  // We loop instead of forEach due to async/await issue w/ forEach callback
  for (let i = 0; i < batches.length; i++) {
    let nonEmptyBatch = !!batches[i].trim();
    if (nonEmptyBatch) await conn.executeNow(`${batches[i]}\n`);
  }
}
// #endregion

module.exports = { ForeignKeys, ModelPropValidations, DataAuditing };
