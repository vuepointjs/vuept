'use strict';

module.exports = function(server) {
  const env = process.env.NODE_ENV || 'development';
  const isDev = env === 'development' || env === 'test';
  const isTemplateDev = process.env.TDEV;

  // Optionally (based on env var) end the LoopBack process after simply displaying the boot sequence and some basic information
  const isInfoOnly = process.env.INFO_ONLY;
  const isVerbose = process.env.VERBOSE;

  if (isInfoOnly) {
    const suiteKey = process.env.npm_package_config_vp_suite_key;
    const appKey = process.env.npm_package_config_vp_app_key;
    const solutionData = require('@vuept_solution/data').getters;
    const suiteData = solutionData.suiteByKey(suiteKey);
    const appData = solutionData.appByKey(suiteData, appKey);

    // Show some basic info and we're finished
    console.log('----------');
    console.log(`NODE_ENV: "${env}"`);
    console.log(`TDEV: ${isTemplateDev}`);

    console.log(`Solution Data File Path: "${solutionData.filePath}"`);
    console.log(`Suite Key: "${suiteKey}"`);
    console.log(`App Key: "${appKey}"`);

    if (isVerbose) {
      console.log('Suite Data:');
      console.dir(suiteData, { depth: 1 });

      console.log('App Data:');
      console.dir(appData, { depth: 1 });
    }

    console.log(`App Path: "${solutionData.appPathByKey(appKey)}"`);

    console.log(`Server configured for port ${server.get('port')}`);

    console.log('>>> Shutting down LoopBack API server process due to INFO_ONLY flag.');
    process.exit(0);
  }
};
