#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const walkSync = require('walkdir').sync;
const spawnSync = require('cross-spawn').sync;
const yargs = require('yargs/yargs');
const chalk = require('chalk');

// Copies the content of a given directory to the destination directory
// Renames file '_.gitignore' to '.gitignore'
function copyDir(dir, dest) {
  return walkSync(dir, (srcPath, stat) => {
    const srcFileName = path.basename(srcPath);
    const destFileName =
      srcFileName === '_.gitignore' ? '.gitignore' : srcFileName;

    const srcFileParent = path.dirname(srcPath);

    const destPath = path.resolve(
      dest,
      path.relative(dir, srcFileParent),
      destFileName,
    );

    if (stat.isDirectory()) {
      fs.mkdirSync(destPath);
      return;
    }

    fs.copyFileSync(srcPath, destPath);
  });
}

function createApp(appName, useReact) {
  if (useReact) {
    console.log('Creating a React application.');
  } else {
    console.log('Creating a vanilla JS application.');
  }

  const root = path.resolve(appName);
  fs.mkdirSync(root);

  const treeName = useReact ? 'react-tree' : 'vanilla-tree';

  copyDir(path.resolve(__dirname, 'project-trees', 'common'), root);
  copyDir(path.resolve(__dirname, 'project-trees', treeName), root);

  const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(root, 'package.json')),
  );
  packageJson.name = appName;
  fs.writeFileSync(
    path.resolve(root, 'package.json'),
    JSON.stringify(packageJson, { spaces: 2 }),
  );

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
