/*
  datasources.local.js

    This file overrides baseline settings in datasources.json.
*/
'use strict';

var env = process.env.NODE_ENV || 'development';
var isDev = env === 'development' || env === 'test';

const db = {
  name: 'db',
  connector: '@vuept/loopback-connector-mssql',
  host: process.env.DB_HOST,
  port: 1433,
  database: process.env.DB_NAME,
  schema: process.env.DB_SCHEMA, // It *is* possible to use a schema other than "dbo"
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  options: {
    appName: '__app-short-name__ API',
    encrypt: true, // SQL Azure requires an encrypted connection
    useUTC: true
  }
};

const datasources = {
  db
};

module.exports = datasources;
