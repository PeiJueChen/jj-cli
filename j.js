#!/usr/bin/env node
'use strict';

const semver = require('semver');

const packageJson = require('./package.json');

const currentNodeVersion = process.version.replace('v', '');
const requiresNodeVersion = packageJson.engines.node;

if (!semver.satisfies(currentNodeVersion, requiresNodeVersion)) {
    const chalk = require('chalk');
    console.error(chalk.red(`ERROR: JJ CLI requires Node ${requiresNodeVersion}`));
    process.exit(1);
}

const run = require('./index');
run(process, process.cwd(), __dirname);
// var cli = require('../dist/index');
// cli.run(process, __dirname);