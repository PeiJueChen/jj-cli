const program = require('commander');
const { openPlatform } = require('./actionOpen');
const logs = require('../../untils/logs');
const common = require('../../untils/common');
const create = (process, currentWorkingDir, cliBinDir) => {
    const options = program.opts() || {};

    program
        .command('open [platform] [-p|--platform] [-studio|--androidStudioPath]')
        .description('opens the native project workspace (xcode for iOS), platform: ios/android')
        .action(platform => {
            openPlatform(platform || options.platform, currentWorkingDir, cliBinDir, options.androidStudioPath)
        });

    program
        .command('openpath [path] [-fp|--folderpath]')
        .description('open folderpath')
        .action( path => {
            path = path || options.folderpath;
            if (!path) {
                logs.logFatal("Missing folder path");
                return;
            }
            common.openUrl(path);
        })
}

module.exports = create