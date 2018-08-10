/*
  add-suite.js

    TODO: Implement script that adds a new "suite" to the solution by prompting for required inputs and:

      - Verifying that the inputs (e.g., suite key) are valid and that the specified suite doesn't already exist
      - Copying .templates/suite to solution/suite/${suite-key}
      - Adding (if necessary) the suite to the json data in /solution/data/tenants/suites.json

    NOTE: For dev, plan to use port range: 33990 - 33999 (max 10 suites/ports)
*/
const solutionSchema = require('@vuept_solution/admin').schema;
const solutionData = require('@vuept_solution/data');
const _ = require('lodash');
const inquirer = require('inquirer');

console.log('\n> Add Suite: Under construction.\n');

inquirer.prompt(questionsFromSchema(solutionSchema.suite)).then(answers => {
  let suiteDataAdded = solutionData.mutations.addSuite(answers);
  if (suiteDataAdded) console.log('\n* Suite added successfully!');

  // Main flow of execution for script ends here
  process.exit(0);
});

// #region Helper Functions
function questionsFromSchema(schema) {
  return _(schema)
    .map(field => netlifyFieldToInquirerQuestion(field))
    .value();
}

function netlifyFieldToInquirerQuestion(field) {
  // TODO: Expand validation, perhaps to separate fxn. And expand input types (choice, int result)
  return {
    type: 'input',
    name: field.name,
    message: `${field.label}:`,
    validate: field.pattern ? input => (RegExp(field.pattern[0]).test(input) ? true : field.pattern[1]) : undefined
  };
}
// #endregion
