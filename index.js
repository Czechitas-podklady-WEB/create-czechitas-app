#!/usr/bin/env node

'use strict';

const fs = require('fs-extra');
const path = require('path');
const spawnSync = require('cross-spawn').sync;
const yargs = require('yargs/yargs');

const argv = yargs(process.argv.slice(2))
  .command({
    command: '$0 <app_name>', 
    desc: 'Create a starter web application', 
    builder: (yargs) => yargs
      .positional('app_name', {
        describe: 'The name of your application',
        type: 'string'
      })
      .option('react', {
        desc: 'Create a React appliaction',
        type: 'boolean',
        default: true,
      })
    }).help().argv;

const root = path.resolve(argv.app_name);
fs.mkdirSync(root);

const projectTree = argv.react ? 'react-tree' : 'vanilla-tree';
fs.copySync(path.resolve(__dirname, projectTree), root);
fs.copySync(path.resolve(__dirname, 'common-files'), root);

const packageJson = fs.readJsonSync(path.resolve(root, 'package.json'));
packageJson.name = argv.app_name;
fs.writeJsonSync(path.resolve(root, 'package.json'), packageJson, {
  spaces: 2,
});

spawnSync('npm', ['install'], { cwd: root, stdio: 'inherit' });
