#!/usr/bin/env node

'use strict';

const fs = require('fs-extra');
const path = require('path');
const spawnSync = require('cross-spawn').sync;
const yargs = require('yargs/yargs');
const chalk = require('chalk');

function createApp(appName, useReact) {
  if (useReact) {
    console.log('Creating a React application.');
  } else {
    console.log('Creating a vanilla JS application.');
  }

  const root = path.resolve(appName);
  fs.mkdirSync(root);

  const projectTree = useReact ? 'react-tree' : 'vanilla-tree';
  fs.copySync(path.resolve(__dirname, projectTree), root);
  fs.copySync(path.resolve(__dirname, 'common-files'), root);

  const packageJson = fs.readJsonSync(path.resolve(root, 'package.json'));
  packageJson.name = appName;
  fs.writeJsonSync(path.resolve(root, 'package.json'), packageJson, {
    spaces: 2,
  });

  console.log('Installing NPM dependencies:');

  spawnSync('npm', ['install'], { cwd: root, stdio: 'inherit' });

  console.log(chalk.green(`Project '${appName}' created successfully.`));
}

const argv = yargs(process.argv.slice(2))
  .command({
    command: '$0 <app_name>',
    desc: 'Create a starter web application',
    builder: (yargs) =>
      yargs
        .positional('app_name', {
          describe: 'The name of your application',
          type: 'string',
        })
        .option('react', {
          desc: 'Create a React application',
          type: 'boolean',
          default: true,
        }),
  })
  .help().argv;

try {
  createApp(argv.app_name, argv.react);
} catch (error) {
  console.error(chalk.redBright(`ERROR: ${error.message}`));
}
