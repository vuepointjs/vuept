'use strict';

module.exports = function(server) {
  // Optionally (based on env var) end the LoopBack process after simply displaying the boot sequence and some basic information
  const envVarInfoOnly = process.env.INFO_ONLY;

  if (envVarInfoOnly) {
    // Show some basic info and we're finished
    console.log(`NODE_ENV: "${process.env.NODE_ENV}"`);
    console.log(`TDEV: ${process.env.TDEV}`);
    console.log(`Suite Key: "${process.env.npm_package_config_vp_suite_key}"`);
    console.log(`App Key: "${process.env.npm_package_config_vp_app_key}"`);

    const solutionData = require('@vuept_solution/data');
    console.log('Suite Data:');
    console.dir(solutionData.getters.suiteByKey(process.env.npm_package_config_vp_suite_key), { depth: null });

    console.log('Shutting down LoopBack API server process due to INFO_ONLY flag.');
    process.exit(0);
  }
};
