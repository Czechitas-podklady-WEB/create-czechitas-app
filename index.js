#!/usr/bin/env node

'use strict';

const path = require('path');
const chalk = require('chalk');
const spawnSync = require('cross-spawn').sync;
const yargs = require('yargs/yargs');
const { fetchKitPlan, initAppFolder, generateApp } = require('whipapp-core');

const DEFAULT_SERVER_URL = 'https://podlomar.github.io/czechitas-starter-kits';

const argv = yargs(process.argv.slice(2))
  .command({
    command: '$0 <app_name> [kit_name]',
    desc: 'Create a starter web application',
    builder: (yargs) => yargs
      .positional('app_name', {
        describe: 'The name of your application',
        type: 'string',
      })
      .positional('kit_name', {
        desc: 'Starter kit template',
        type: 'string',
        default: 'react',
      })
      .option('s', {
        alias: 'server',
        default: DEFAULT_SERVER_URL,
        describe: 'URL from where to fetch the kit files',
        type: 'string'
    })
  }).help().argv;

(async () => {
  try {
    const rootDir = path.resolve('.');
    const kitPlan = await fetchKitPlan(argv.kit_name, argv.server);
    if (kitPlan.status === 'error') {
      console.error(chalk.redBright('ERROR:', kitPlan.message));
      return;
    }

    const result = initAppFolder(rootDir, argv.app_name);
    if (result.status === 'error') {
      console.error(chalk.redBright('ERROR:', result.message));
      return;
    }

    console.log(result);
    await generateApp(result.appRoot, kitPlan);
  
    console.log('Installing NPM dependencies:');
    spawnSync('npm', ['install'], { cwd: result.appRoot, stdio: 'inherit' });

    console.log(chalk.green(`Project '${argv.app_name}' created successfully.`));
  } catch (error) {
    console.error(chalk.redBright(`ERROR: ${error.message}`));
  }
})();
