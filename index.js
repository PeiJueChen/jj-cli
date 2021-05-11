
const program = require('commander');

const loadCommand = require('./lib/core');
process.on('unhandledRejection', error => {
    const chalk = require('chalk');
    console.error(chalk.red('[fatal]'), chalk.bold.blue(error));
});

// cliBinDir: __dirname
const run = (process, currentWorkingDir, cliBinDir) => {
    program.version(require('./package.json').version);
    program.version(require('./package.json').version, '-v --version');

    loadCommand(process, currentWorkingDir, cliBinDir);

    program.parse(process.argv);

    // if (program.args.length < 2) {
    //     console.log(`\n  ${'⚡️'}  ${chalk_1.default.bold('Capacitor - Cross-Platform apps with JavaScript and the Web')}  ${'⚡️'}`);
    //     program.help();
    // }
}

module.exports = run;