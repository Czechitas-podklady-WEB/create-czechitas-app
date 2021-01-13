#!/usr/bin/env node

'use strict';

const fs = require('fs-extra');
const path = require('path');
const spawnSync = require('child_process').spawnSync;

const projectName = process.argv[2];
const root = path.resolve(projectName);

fs.mkdirSync(root);
fs.copySync(path.resolve(__dirname, 'project-tree'), root);

const packageJson = fs.readJsonSync(path.resolve(root, 'package.json'));
packageJson.name = projectName;
fs.writeJsonSync(path.resolve(root, 'package.json'), packageJson, {
  spaces: 2,
});

spawnSync('npm', ['install'], { cwd: root, stdio: 'inherit' });
