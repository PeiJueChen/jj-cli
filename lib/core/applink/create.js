const program = require('commander');
const { applink } = require('./action');
const create = (process, currentWorkingDir, cliBinDir) => {
    const options = program.opts() || {};

    program
        .command('applink [platform] [-appcenter|--appcenter]')
        .description('get your app link at appcenter')
        .action(platform => {
            applink(platform, currentWorkingDir, options?.appcenter);
        })
}

module.exports = create