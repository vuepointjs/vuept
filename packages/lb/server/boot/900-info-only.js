'use strict';
// console.log('\x1b[33m%s\x1b[0m', `>>> >>> BOOT: ${__filename}`);

module.exports = function(server) {
  const solutionRole = process.env.npm_package_config_vp_solution_role;
  const suiteKey = process.env.npm_package_config_vp_suite_key;
  const appKey = process.env.npm_package_config_vp_app_key || null;
  const vpCtx = require('@vuept_solution/data').context.fromRoleAndKeys(solutionRole, suiteKey, appKey);

  // Optionally (based on env var) end the nuxt build process after simply displaying some basic information
  if (vpCtx.isInfoOnly) {
    // Show some basic info and we're finished
    console.log('----------');
    console.dir(vpCtx, { depth: vpCtx.isVerbose ? 2 : 0 });
    console.log('>>> Shutting down LoopBack API server process due to INFO_ONLY flag.');
    process.exit(0);
  }
};
