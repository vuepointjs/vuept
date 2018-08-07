/*
  add-pkg.js

    TODO: Implement script that adds a new package to VuePoint.js by accepting a pkg name string argument and:

      - Verifying that the pkg name is valid (of the right form) and that the specified pkg doesn't already exist
      - Copying .templates/pkg to packages/${pkg-name}
*/

const pkgName = process.argv[2];

if (!pkgName) {
  console.log('\n\nadd:pkg - Missing required <pkg-name> arg');
  console.log('Format: npm run add:pkg "<pkg-name>"');
  process.exit(1);
}

console.log(`add-pkg: Under construction. Soon your specified pkg "${pkgName}" will be added to VuePoint.js.`);

// Main flow of execution for script ends here
process.exit(0);
