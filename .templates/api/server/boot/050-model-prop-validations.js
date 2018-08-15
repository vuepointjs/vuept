'use strict';
const vp = require('../vp');

// LoopBack boot script main entry point
module.exports = function(app) {
  console.log('Setup custom model validations...');
  try {
    vp.ModelPropValidations.add(app);

    console.log('Custom model validation setup completed.');
  } catch (e) {
    console.log('Error setting up custom model validations: ' + e);
  }
};
