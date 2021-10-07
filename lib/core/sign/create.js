const program = require('commander');
const { signPlatform } = require('./action');
const create = (process, currentWorkingDir, cliBinDir) => {
    const options = program.opts() || {};

    program
        .command('sign [platform] [-p|--platform]')
        .description('Help you sign android apk; platform: android(default) ')
        .action(platform => {
            signPlatform(platform || options.platform || 'android', currentWorkingDir, cliBinDir)
        })
}

module.exports = create