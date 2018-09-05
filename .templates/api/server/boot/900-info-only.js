'use strict';

module.exports = function(server) {
  // Optionally (based on env var) end the LoopBack process after simply displaying the boot sequence and some basic information
  const envVarInfoOnly = process.env.INFO_ONLY;

  if (envVarInfoOnly) {
    // Show some basic info and we're finished
    console.log(`NODE_ENV: "${process.env.NODE_ENV}"`);
    console.log(`App Key: "${process.env.npm_package_config_vp_key}"`);

    console.log('Shutting down LoopBack API server process due to INFO_ONLY flag.');
    process.exit(0);
  }
};
