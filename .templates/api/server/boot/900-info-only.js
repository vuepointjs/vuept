'use strict';

module.exports = function(server) {
  // Optionally (based on env var) end the LoopBack process after simply displaying the boot sequence and some basic information
  const envVarInfoOnly = process.env.INFO_ONLY;

  if (envVarInfoOnly) {
    const suiteKey = process.env.npm_package_config_vp_suite_key;
    const appKey = process.env.npm_package_config_vp_app_key;
    const solutionData = require('@vuept_solution/data');
    const suiteData = solutionData.getters.suiteByKey(suiteKey);
    const appData = solutionData.getters.appByKey(suiteData, appKey);

    // Show some basic info and we're finished
    console.log(`NODE_ENV: "${process.env.NODE_ENV}"`);
    console.log(`TDEV: ${process.env.TDEV}`);

    console.log(`Solution Data File Path: "${solutionData.filePath}"`);
    console.log(`Suite Key: "${suiteKey}"`);
    console.log(`App Key: "${appKey}"`);

    console.log('Suite Data:');
    console.dir(suiteData, { depth: 1 });

    console.log('App Data:');
    console.dir(appData, { depth: 1 });
    console.log(`App Path: "${solutionData.getters.appPathByKey(appKey)}"`);

    console.log(`Server configured for port ${server.get('port')}`);

    console.log('Shutting down LoopBack API server process due to INFO_ONLY flag.');
    process.exit(0);
  }
};
