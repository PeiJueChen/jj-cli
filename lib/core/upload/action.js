const logs = require('../../untils/logs');
const common = require('../../untils/common');
const common2 = require('./common');
const { runSpawnCommand } = require('../../untils/terminal');
const configParse = require('../../untils/parse-config');
const signAction = require('./../sign/action');
const { pgyerUpload } = require('./pgyer');
const platforms = {
    ios: 'ios',
    android: 'android'
}
var projectName;
var currentConfigDir;
const uploadApp = async (platform, currentWorkingDir, cliBinDir, notes, apppath, projectname, folderpath, appcenter, closedfolder) => {
    projectName = projectname;
    currentConfigDir = folderpath || currentWorkingDir;
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

    try {
        // upload with config file
        const { config, configPathDiretory } = await configParse.parseConfigPromise(currentConfigDir);
        const app = await common2.findPackageApp(p, currentWorkingDir, apppath);
        const appPath_ = app && app.fullPath;

        try {
            var project = await configParse.askProjects(config, projectName);
        } catch (error) {
            logs.logFatal('Please write all `project` field as project name');
        }

        let hasPgyer = hasObject(project.pgyer);
        let hasAppcenter = hasObject(project.appcenter);
        if (!hasPgyer && !hasAppcenter) {
            logs.logFatal('Cannot find your pgyer or appcenter config');
        }

        if (hasPgyer && hasAppcenter) {
            const website = await common.askSelectList(['pgyer', 'appcenter'], "Website");
            hasPgyer = website === 'pgyer';
            hasAppcenter = website === 'appcenter'
        }

        if (hasAppcenter) {
            await signAction.uploadToAppcenter(appPath_, project.appcenter, p, config.defaultAppcenterToken, appcenter, closedfolder)
        }

        if (hasPgyer) {
            await pgyerUpload(p, appPath_, project, config, closedfolder);
        }


    } catch (error) {
        common2.uploadPlatform(p, currentWorkingDir, notes, apppath, closedfolder);
    }

}

const hasObject = (object) => {
    return object && Object.keys(object).length > 0;
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