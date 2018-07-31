/*
  add-suite.js

    TODO: Implement script that adds a new "suite" to the solution by prompting for required inputs and:

      - Verifying that the inputs (e.g., suite key) are valid and that the specified suite doesn't already exist
      - Copying .templates/suite to solution/suite/{{suite-key}}
      - Adding (if necessary) the suite to the json data in /solution/data/tenants/suites.json
*/

// const suiteKey = process.argv[2];
// const suites = require('@vuept/solution-data').suites;

// if (!suiteKey) {
//   console.log('\n\nadd:suite - Missing required <suite-key> arg');
//   console.log('Format: npm run add:suite "<suite-key>"');
//   process.exit(1);
// }

// console.log();
// console.log(`add-suite: Under construction. Soon your specified suite "${suiteKey}" will be added to the solution.`);
// console.log(`           Suite count: ${suites.length}\n`);

// // Main flow of execution for script ends here
// process.exit(0);

const schema = require('@vuept/solution-admin').schema;

console.log('\nsuite schema...');
console.log(schema.suite);

console.log('\napp schema...');
console.log(schema.app);

console.log('\napplet schema...');
console.log(schema.applet);

console.log('\nview schema...');
console.log(schema.view);

const inquirer = require('inquirer');
const questions = [];

// inquirer.prompt(questions).then(answers => {
//   console.log(answers);
// });
