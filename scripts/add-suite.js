/*
  add-suite.js

    TODO: Implement script that adds a new "suite" to the solution by prompting for required inputs and:

      - Verifying that the inputs (e.g., suite key) are valid and that the specified suite doesn't already exist
      - Copying .templates/suite to solution/suite/{{suite-key}}
      - Adding (if necessary) the suite to the json data in /solution/data/tenants/suites.json
*/

const schema = require('@vuept/solution-admin').schema;
const suites = require('@vuept/solution-data').suites;
const _ = require('lodash');
const inquirer = require('inquirer');

console.log('\n> Add Suite: Under construction.\n');

inquirer.prompt(questionsFromSchema(schema.suite)).then(answers => {
  console.log(answers);

  // Main flow of execution for script ends here
  process.exit(0);
});

// #region Helper Functions
function questionsFromSchema(schema) {
  // TODO: Expand validation, perhaps to sep. fxn., allow check for unique key (against existing data in "suites")
  return _(schema)
    .map(val => ({
      type: 'input',
      name: val.name,
      message: `${val.label}:`,
      validate: val.pattern ? input => (RegExp(val.pattern[0]).test(input) ? true : val.pattern[1]) : undefined
    }))
    .value();
}
// #endregion
