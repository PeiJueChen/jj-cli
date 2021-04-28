const program = require('commander');
const { openPlatform } = require('./actionOpen');
const createOpen = (process, currentWorkingDir, cliBinDir) => {
    const options = program.opts() || {};

    program
        .command('open [platform] [-p|--platform]')
        .description('opens the native project workspace (xcode for iOS), platform: ios/android')
        .action(platform => {
            openPlatform(platform || options.platform, currentWorkingDir, cliBinDir, options.androidStudioPath)
        })
}

module.exports = {
    createOpen
}