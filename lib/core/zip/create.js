const program = require('commander');
const { runCommand } = require('../../untils/terminal');
const logs = require('../../untils/logs');
const { zip } = require('./action');
const format = require('../../untils/format');
const create = (process, currentWorkingDir, cliBinDir) => {
    const options = program.opts() || {};

    program
        .command('zip [-output|--output]')
        .description('Help you zip file or folder')
        .action(params => {
            let outputName = options.output;
            if (!outputName) {
                const date = format.formatDate(new Date().getTime(), 'yyyy-MM-dd-hhmmss');
                outputName = `build-${date}.zip`
            }
            let args = program.args;
            if (args.length == 1) {
                logs.logFatal('Please write down the files you need to compress.')
                return;
            }

            zip(outputName, currentWorkingDir, cliBinDir, ...args);


        })
}

module.exports = create