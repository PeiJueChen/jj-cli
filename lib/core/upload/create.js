const program = require('commander');
const { uploadApp, logoutAppcenter, loginAppcenter } = require('./action');

const createUpload = (process, currentWorkingDir, cliBinDir) => {
    const options = program.opts() || {};

    program
        .command('upload [platform] [-p|--platform]')
        .description('upload your apk/ipa to appcenter, platform: ios/android')
        .action(platform => {
            uploadApp(platform || options.platform, currentWorkingDir, cliBinDir, options.notes, options.apppath)
        })


    program
        .command('appcenter [logout] [login]')
        .description('logout your appcenter')
        .action(async (param) => {
            const map = new Map([
                ['login', () => {
                    loginAppcenter();
                }],
                ['logout', () => {
                    logoutAppcenter();
                }]
            ])
            const action = map.get(param);
            if (!action) throw new Error('Please point : login/logout');
            action && action();
        })

}

module.exports = {
    createUpload
}