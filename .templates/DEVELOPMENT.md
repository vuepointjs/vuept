# Template Development

The `.templates` folder contains baseline implementations for pieces of an overall VuePoint.js (VP)
solution: Suites, Apps, and APIs.

Those who wish to implement an end-user solution using VuePoint.js would typically clone or download
the `master` branch. But this `template-dev` branch exists to track the additional files/artifacts
needed to provide a harness for developing and testing the templates themselves.

## Getting Started

Follow these steps to get started. These steps assume that you have already cloned the VP repo into a local folder
and that you are at a command prompt with your clone folder as your current working directory.

1. Switch to the `template-dev` branch

   ```bash
   git checkout template-dev
   ```

1. [Install Docker](https://store.docker.com/editions/community/docker-ce-desktop-windows)

1. Make sure that your Docker settings allow containers to access _at least_ 2GB of memory (4GB and 4 CPUs recommended)

1. Install a local SQL Server Docker container, create the VP Dev DB, and initialize the DB schema:

   ```bash
   yarn tdev:install

   # If necessary, you can reverse the above and uninstall by running:
   # yarn tdev:uninstall
   ```

1. Now (optional) you can verify the installation if you wish:

   ```bash
   # List the SQL Server database files on the container's file system
   yarn tdev:db:ls

   # Or issue a SQL Server command to list the names of the tables in the "vpdev" DB
   yarn tdev:sql "use vpdev; select name from sysobjects where type = 'U'"
   ```

1. Finally, execute the following command to launch the database, API, and App:

   ```bash
   # Kick-off template development and watch for source code changes
   yarn tdev

   # Alternatively, for verbose logging to the command console use this variant
   yarn tdev:verbose
   ```

Following the steps above is safe for local development and it's safe to document/expose the password because
by default the **Express** edition of SQL Server is configured to _not_ accept connections from other computers.

Note that you can now safely _stop_ and _start_ your container:

```bash
# stop
docker stop vuept-sql-dev1

# start again
docker start vuept-sql-dev1

# list containers, check status
docker container ls --all
```

But be aware that _as setup_ there is _no permanent storage volume_, so do not destroy (remove) the container unless
you want to start over with your DEV environment:

```bash
# NO! ...unless you want to lose your DEV environment
docker rm vuept-sql-dev1
```

...more details Coming Soon!
