#!/usr/bin/env node

'use strict';

const path = require('path');
const chalk = require('chalk');
const spawnSync = require('cross-spawn').sync;
const yargs = require('yargs/yargs');
const { fetchKitPlan, initAppFolder, generateApp } = require('whipapp-core');

const REPO_URL = 'https://api.github.com/repos/podlomar/czechitas-starter-kits';

const argv = yargs(process.argv.slice(2))
  .command({
    command: '$0 <app_name> <kit_name>',
    desc: 'Create a starter web application',
    builder: (yargs) =>
      yargs
        .positional('app_name', {
          describe: 'The name of your application',
          type: 'string',
        })
        .positional('kit_name', {
          desc: 'Starter kit template',
          type: 'string',
          default: 'react',
        }),
    }).help().argv;

(async () => {
  try {
    console.log(argv.app_name);
    console.log(argv.kit_name);
    const rootDir = path.resolve('.');
    const kitPlan = await fetchKitPlan(argv.kit_name, REPO_URL);
    const { appRoot } = initAppFolder(rootDir, argv.app_name);
    await generateApp(argv.app_name, kitPlan);
  
    console.log('Installing NPM dependencies:');
    spawnSync('npm', ['install'], { cwd: appRoot, stdio: 'inherit' });

    console.log(chalk.green(`Project '${argv.app_name}' created successfully.`));
  } catch (error) {
    console.error(chalk.redBright(`ERROR: ${error.message}`));
  }
})();
