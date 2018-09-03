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

1. Setup and start a local SQL Server Docker container:

   ```bash
   docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=vueptDEV1!" -e "MSSQL_PID=Express" --name vuept-sql-dev1 -p 1433:1433 -d microsoft/mssql-server-linux:latest
   ```

1. Now use Docker to execute a local SQL command on the container to create the VuePoint.js DEV database `vpdev`:

   ```bash
   docker exec vuept-sql-dev1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P vueptDEV1! -Q "create database vpdev"
   ```

   and to query SQL Server and verify that the database was created you can run:

   ```bash
   docker exec vuept-sql-dev1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P vueptDEV1! -h -1 -W -Q "sp_helpdb" | grep vpdev
   ```

   which should return:

   ```bash
   vpdev      16.00 MB sa ...
   ```

   or you could list the SQL Server database files on the container's file system using this command:

   ```bash
   docker exec vuept-sql-dev1 ls -lh /var/opt/mssql/data
   ```

1. (Coming Soon... instructions for generating the database tables via LoopBack auto-update/auto-migrate)

1. Finally, execute the following command to launch the database, API, and App:

   ```bash
   # Kick-off template development and watch for source code changes
   yarn tdev

   # Alternatively, for minimal debug logging to the command console use this variant
   yarn tdev:quiet
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
