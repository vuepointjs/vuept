/*
  add-suite.js

    TODO: Implement script that adds a new "suite" to the solution by accepting a suite key string argument and:
    
      - Verifying that the suite key is valid (of the right form) and that the specified suite doesn't already exist
      - Copying .templates/suite to solution/suite/{{suite-key}}
      - Adding (if necessary) the suite to the json data in /solution/data/Tenants/Suites.json
*/

const suiteKey = process.argv[2];

if (!suiteKey) {
  console.log('\n\nadd:suite - Missing required <suite-key> arg');
  console.log('Format: npm run add:suite "<suite-key>"');
  process.exit(1);
}

console.log(`add-suite: Under construction. Soon your specified suite "${suiteKey}" will be added to the solution.`);

// Main flow of execution for script ends here
process.exit(0);
