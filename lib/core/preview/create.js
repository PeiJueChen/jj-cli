const program = require('commander');
const { preview } = require('./action');
const create = (process, currentWorkingDir, cliBinDir) => {
    const options = program.opts() || {};
    program
        .command('preview [-host|--host] [-port|--port]')
        .description('opens the native project workspace (xcode for iOS), platform: ios/android')
        .action(() => {
            preview(process, currentWorkingDir, options.host || 'localhost', options.port || 5000, options.staticFolderName || 'dist')
        })
}

module.exports = create