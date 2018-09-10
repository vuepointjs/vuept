'use strict';

const isInfoOnly = process.env.INFO_ONLY;
const dotenv = require('dotenv');
const loopback = require('loopback');
const boot = require('loopback-boot');
const app = loopback();
const http = require('http');
const https = require('https');
const serverDirAPI = __dirname; // server dir local to this API implementation
const vpLoopBackServer = require('@vuept/lb').server;

if (isInfoOnly) {
  console.log('----------');
  console.log('>>> Starting LoopBack API server...');
}

// Attempt to read .env file
console.log('Read env variables in .env file.');
const dotenvConfig = dotenv.config();

// Have VuePoint.js start the LoopBack server
const isServerStartup = require.main === module;
vpLoopBackServer.start(dotenvConfig, boot, app, http, https, serverDirAPI, isServerStartup);

module.exports = app;
