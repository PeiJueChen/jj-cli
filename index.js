#!/usr/bin/env node

const program = require('commander');

const helpOpitons = require('./lib/core/help');
const { createCommands } = require('./lib/core/creators/createGit');
const { optionGit } = require('./lib/core/options/optionGit');

program.version(require('./package.json').version);
program.version(require('./package.json').version, '-v --version');


helpOpitons();
optionGit();



createCommands();

program.parse(process.argv);