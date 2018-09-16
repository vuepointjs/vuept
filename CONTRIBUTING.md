# Contributing to VuePoint.js (VP)

If you're interested in working on the core VP toolkit (instead of an end solution that simply _uses_ VP) you'll want to follow the following workflow:

- Clone this repo and open a command prompt in your clone folder

- Switch to the `template-dev` branch (`git checkout template-dev`)

- Pull the latest code (`git pull`)

- Open VSCode (`code .`) and simply run the `tdev` task ("Terminal" menu, "Run Task...", "tdev") to kick-off the local template development harness sites in "watch" mode

- Now, open a browser to view the template site(s) you wish to work on and make your changes to the VP templates and packages in VSCode and you'll immediately see your changes in the browser

- However, _note carefully_ that there are _2 distinct types of code changes_ you could make:

  1. Changes to VP template sites and packages, which should be checked-in (committed) to the **master** branch **only**, and

  1. Changes to the template development "environment" or "harness", such as tweaks to the `template-dev` **.env** file or LoopBack models, which should be checked-in to the **template-dev** branch, _never to the master branch_

- Therefore, even though you need to be on the `template-dev` branch when doing VP core development so that you have _access to the template dev "harness" files_, when it comes time to make a _commit_ (check-in) you'll need to _think carefully_

  - _Most_ commits should be made on the **master** branch (or possibly the **dev** branch), so you'll need to **`git checkout master`** (or dev) _just before doing your commit_. This will move your in-progress work from your local development harness area on `template-dev` to the `master` branch

  - But you'll need to avoid mixing into these commits any changes that should stay in the `template-dev` branch

- Finally, after you have made your commit to the **master** branch, you'll need to merge those changes back into the **template-dev** branch, favoring any local harness changes that reside in **template-dev**

  ```bash
  # Switch back to template-dev
  git checkout template-dev

  # Merge changes from master back into template-dev, preserving dev harness stuff
  git merge -s recursive -X ours master

  # Update template-dev branch with merged changes
  git add --all
  git commit -am "Merge"
  git pull
  git push
  ```
