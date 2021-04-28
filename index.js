
const program = require('commander');

const helpOpitons = require('./lib/core/help');
const { createGit } = require('./lib/core/git/createGit');
const { optionGit } = require('./lib/core/git/optionGit');
const { createOpen } = require('./lib/core/open/createOpen');
const { optionOpen } = require('./lib/core/open/optionOpen');

process.on('unhandledRejection', error => {
    const chalk = require('chalk');
    console.error(chalk.red('[fatal]'), chalk.bold.blue(error));
});

// cliBinDir: __dirname
const run = (process, currentWorkingDir, cliBinDir) => {
    // console.log("JJ ~ file: index.js ~ line 16 ~ run ~ currentWorkingDir", currentWorkingDir, cliBinDir);
    program.version(require('./package.json').version);
    program.version(require('./package.json').version, '-v --version');

    helpOpitons();
    optionGit();
    optionOpen()



    createGit(process, currentWorkingDir, cliBinDir);
    createOpen(process, currentWorkingDir, cliBinDir);

    program.parse(process.argv);

    // if (program.args.length < 2) {
    //     console.log(`\n  ${'⚡️'}  ${chalk_1.default.bold('Capacitor - Cross-Platform apps with JavaScript and the Web')}  ${'⚡️'}`);
    //     program.help();
    // }
}

module.exports = run;