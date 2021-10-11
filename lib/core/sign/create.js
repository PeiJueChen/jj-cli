const program = require('commander');
const { signPlatform } = require('./action');
const create = (process, currentWorkingDir, cliBinDir) => {
    const options = program.opts() || {};

    program
        .command('sign [platform] [-p|--platform] [-pn|--projectname] [-fp|--folderpath] [-appcenter|--appcenter]')
        .description('Help you sign android apk; platform: android(default) ')
        .action(platform => {

            signPlatform({
                platform: platform || options.platform || 'android',
                currentWorkingDir,
                cliBinDir,
                projectname: options.projectname,
                folderpath: options.folderpath,
                appcenter: options.appcenter
            })
        })
}

module.exports = create