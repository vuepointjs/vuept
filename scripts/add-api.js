/*
  add-api.js

    TODO: Implement script that adds a new API to the solution by accepting a api key string argument and:
    
      - Verifying that the api key is valid (of the right form) and that the specified api doesn't already exist
      - Copying .templates/api to solution/api/{{api-key}}
*/

const apiKey = process.argv[2];

if (!apiKey) {
  console.log('\n\nadd:api - Missing required <api-key> arg');
  console.log('Format: npm run add:api "<api-key>"');
  process.exit(1);
}

console.log(`add-api: Under construction. Soon your specified api "${apiKey}" will be added to the solution.`);

// Main flow of execution for script ends here
process.exit(0);
