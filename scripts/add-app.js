/*
  add-app.js

    TODO: Implement script that adds a new app to the solution by accepting an app key string argument and:
    
      - Verifying that the app key is valid (of the right form) and that the specified app doesn't already exist
      - Copying .templates/app to solution/app/{{app-key}}
      - Adding (if necessary) the app to the json data in /solution/data/Tenants/Suites.json
*/

const appKey = process.argv[2];

if (!appKey) {
  console.log('\n\nadd:app - Missing required <app-key> arg');
  console.log('Format: npm run add:app "<app-key>"');
  process.exit(1);
}

console.log(`add-app: Under construction. Soon your specified app "${appKey}" will be added to the solution.`);

// Main flow of execution for script ends here
process.exit(0);
