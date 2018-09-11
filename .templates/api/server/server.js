'use strict';

const isInfoOnly = process.env.INFO_ONLY;
const loopback = require('loopback');
const app = loopback();
const vpLoopBackServer = require('@vuept/lb').server;

if (isInfoOnly) {
  console.log('----------');
  console.log('>>> Starting LoopBack API server...');
}

// Have VuePoint.js start the LoopBack server
const isServerStartup = require.main === module;
vpLoopBackServer.start(require('dotenv').config(), require('loopback-boot'), app, require('http'), require('https'), __dirname, isServerStartup);

module.exports = app;
