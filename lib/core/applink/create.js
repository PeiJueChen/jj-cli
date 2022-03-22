const program = require('commander');
const { applink } = require('./action');
const create = (process, currentWorkingDir, cliBinDir) => {
    const options = program.opts() || {};

    program
        .command('applink [platform]')
        .description('get your app link at appcenter')
        .action(platform => {
            applink(platform, currentWorkingDir);
        })
}

module.exports = create