const logs = require('../../untils/logs');
const common = require('../../untils/common');
const common2 = require('./common');
const { runSpawnCommand } = require('../../untils/terminal');

const platforms = {
    ios: 'ios',
    android: 'android'
}
// const common2 = require('./common');
const uploadApp = async (platform, currentWorkingDir, cliBinDir, notes, apppath) => {
    let install = await common.isInstalled('appcenter');
    if (!install) logs.logFatal(`Not found "appcenter", Please install first: 'npm install -g appcenter-cli'. ref: https://www.npmjs.com/package/appcenter-cli`);

    const platform_ = platform && platform.toLowerCase().trim();
    var p = platforms[platform_];
    if (!p) {
        let name = await common.askPlatform();
        p = platforms[name];
        if (!p) {
            logs.logFatal('Only support ios/android now.');
            return;
        }
    }

    common2.uploadPlatform(p, currentWorkingDir, notes, apppath);
}

const logoutAppcenter = async () => {
    let install = await common.isInstalled('appcenter');
    if (!install) logs.logFatal(`Not found "appcenter", Please install first: 'npm install -g appcenter-cli'. ref: https://www.npmjs.com/package/appcenter-cli`);
    try {
        await common.runTask(`logout...`, async () => {
            await runSpawnCommand('appcenter logout');
            logs.logInfo('~End~');
        })
    } catch (error) {
        throw error;
    }
}
const loginAppcenter = async () => {
    let install = await common.isInstalled('appcenter');
    if (!install) logs.logFatal(`Not found "appcenter", Please install first: 'npm install -g appcenter-cli'. ref: https://www.npmjs.com/package/appcenter-cli`);
    try {
        await common.runTask(`login...`, async () => {
            await runSpawnCommand('appcenter login');
            logs.logInfo('~End~');
        })
    } catch (error) {
        throw error;
    }
}
module.exports = {
    uploadApp,
    logoutAppcenter,
    loginAppcenter
}