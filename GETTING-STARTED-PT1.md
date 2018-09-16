# Getting Started

## Install Prerequisites

There are three prerequisites for working with this codebase:

1.  [Node.js](https://nodejs.org/en/download/) v10.10 or greater (LTS version as of October 2018)
1.  [Yarn](https://yarnpkg.com/en/docs/install) v1.9.4 or greater
1.  [Docker](https://www.docker.com/community-edition#/download) v18.06.1 or greater (Latest Stable Docker Community Edition (CE))

[VSCode](https://code.visualstudio.com/download) is also highly recommended for code editing. The overall development experience with this codebase has been optimized for VSCode.

So before proceeding be sure to install those pieces if you don't already have them.

## Clone or Download This Repo

This repo is organized as a ["monorepo"](https://github.com/babel/babel/blob/master/doc/design/monorepo.md) containing multiple public and private sub-packages. [Lerna](https://github.com/lerna/lerna) is used to help manage all of the packages. So to get started the first step is to:

- [Clone](https://github.com/slathrop/git-scripts-win/blob/master/README.md) or download [this repo](https://github.com/vuepointjs/vuept)
- Open a command prompt, and
- Change directory (cd) into your local clone or download folder

## Recommended Global Package Installs

It is recommended, especially on Windows, that you install Lerna globally to avoid [potential issues](https://github.com/zkat/npx/issues/144) with the way its location is resolved. This is really only important if you know Lerna and anticipate running custom Lerna commands from the command line.

From a command prompt run:

```bash
yarn global add lerna
```

Or with NPM:

```bash
npm install -g lerna
```

## Bootstrap the Codebase

Now, from a command prompt (with your current working directory set to your clone or download location) run:

```bash
yarn bootstrap
```

> Note that this is **not** the typical `npm install` command to get started. Instead, we use Yarn and Lerna to install and [bootstrap](https://github.com/lerna/lerna/tree/master/commands/bootstrap#readme) all of the packages.

## Create Your Suite of Web Apps

Details Coming Soon!

Simple scripts will be available from the command line, such as:

```bash
yarn add:suite
```

to add your Suite of Apps.

And:

```bash
yarn add:app
```

to add an App to your Office Suite.

Until these scripts become available you can copy the relevant pieces from the `.templates` folders to the `solution` folder. Examples for this will be made available.
