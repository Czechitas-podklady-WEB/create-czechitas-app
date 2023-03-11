#!/usr/bin/env node

const chalk = require('chalk');

'use strict';

console.info(chalk.red('DISCONTINUATION NOTICE:'));

console.info(`
This package is discontinued and will no longer generate any projects!
Use the successor package create-kodim-app like this:

npm init kodim-app my-app
`);
