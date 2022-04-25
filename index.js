#!/usr/bin/env node

'use strict';

const path = require('path');
const chalk = require('chalk');
const spawnSync = require('cross-spawn').sync;
const yargs = require('yargs/yargs');
const axios = require('axios');
const fs = require('fs');

const REPO_URL = 'https://czechitas-podklady-web.github.io/czechitas-starter-kits/';

const argv = yargs(process.argv.slice(2))
  .command({
    command: '$0 <app_name> [kit_name]',
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

function fileURL(repoURL, path) {
  if (!path.startsWith('/')) {
    path = '/' + path
  }
  if (repoURL.endsWith('/')) {
    repoURL = repoURL.slice(0, repoURL.length - 1)
  }
  return repoURL + path;
}

async function copy(repoURL, srcPath, destPath) {
  console.log('Downloading', srcPath, '→', destPath);
  const response = await axios.get(fileURL(repoURL, srcPath), {
    responseType: 'stream',
  });

  const destParent = path.dirname(destPath);

  fs.mkdirSync(destParent, { recursive: true });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(destPath);

    let error = null;
    writer.on('error', (err) => {
      error = err;
      writer.close();
      reject(err);
    });

    writer.on('close', () => {
      if (!error) {
        resolve(true);
      }
    });

    response.data.pipe(writer);
  });
};

async function fetchKitPlan(kitName, repoURL = DEFAULT_REPO_URL) {
  const name = kitName || 'plain';
  try {
    const response = await axios.get(fileURL(repoURL, `/kits/${name}.json`), {
      headers: {
        Accept: 'application/json',
      }
    });

    return {
      repository: repoURL,
      name,
      patterns: response.data,
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      error.message = `Starter kit template '${kitName}' doesn't exist.`
      throw error
    }
    throw error
  }
}

async function initAppFolder(rootDir, appName) {
  const appRoot = path.resolve(rootDir, appName);

  if (appName !== '.') {
    if (fs.existsSync(appRoot)) {
      throw {
        message: `Directory '${appName}' already exists in '${rootDir}'. Can't overwrite it.`
      }
    }
    await fs.promises.mkdir(appRoot);
  }

  return {
    appRoot,
    appName: appName === '.' ? 'app' : appName,
  };
}

async function generateApp(appRoot, kitPlan) {
  for (const pattern of kitPlan.patterns) {
    const kit = pattern.kit || `kits/${kitPlan.name}`;
    const sources = Array.isArray(pattern.from) ? pattern.from : [pattern.from];

    for (const source of sources) {
      const srcName = pattern.name || path.basename(source);
      await copy(
        kitPlan.repository,
        `${kit}/${source}`,
        path.join(appRoot, pattern.to, srcName)
      );
    }
  }
}

(async () => {
  try {
    const rootDir = path.resolve('.');
    const kitPlan = await fetchKitPlan(argv.kit_name, REPO_URL);
    const { appRoot } = await initAppFolder(rootDir, argv.app_name);
    await generateApp(argv.app_name, kitPlan);

    console.log('Installing NPM dependencies:');
    spawnSync('npm', ['install'], { cwd: appRoot, stdio: 'inherit' });

    console.log(chalk.green(`Project '${argv.app_name}' created successfully.`));
  } catch (error) {
    console.error(chalk.redBright(`ERROR: ${error.message}`));
  }
})();
