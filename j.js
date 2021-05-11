#!/usr/bin/env node
'use strict';

const semver = require('semver');
const path = require('path');
const packageJson = require(path.resolve(__dirname, 'package.json'));
const currentNodeVersion = process.version.replace('v', '');
const requiresNodeVersion = packageJson.engines.node;

process.title = "jj-cli";

if (!semver.satisfies(currentNodeVersion, requiresNodeVersion)) {
    const chalk = require('chalk');
    console.error(chalk.red(`ERROR: JJ CLI requires Node ${requiresNodeVersion}`));
    process.exit(1);
}


const run = require('./index');
run(process, process.cwd(), __dirname);


const args = process.argv.slice(2);
// version notifier
if (args.indexOf("--quiet") === -1) {
    const updateNotifier = require("update-notifier");
    // eslint-disable-next-line security/detect-non-literal-require
    const notifier = updateNotifier({ pkg: packageJson });
    notifier.notify();
}




