/*
  This root folder app.js startup code is needed to allow Azure App Service (Windows)
  to successfully start the LoopBack API site.

  Typically, this file is not needed and running:

    "npm start",
    "node .", or
    "npm run dev", or
    "yarn dev"

  in the root project folder is just fine, but the Azure PaaS layer can't handle it.
*/
var app = require('./server/server.js');
app.start();
