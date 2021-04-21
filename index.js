#!/usr/bin/env node

const program = require('commander');

const helpOpitons = require('./lib/core/help');
const { createCommands } = require('./lib/core/create');
program.version(require('./package.json').version);
program.version(require('./package.json').version, '-v --version');

helpOpitons();

createCommands();

program.parse(process.argv);