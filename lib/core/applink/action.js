const logs = require('../../untils/logs');
const common = require('../../untils/common');
const { platforms } = require('../../constants/platforms');
const configParse = require('../../untils/parse-config');
const applink = async (platform, currentWorkingDir) => {
    const platform_ = platform && platform.toLowerCase().trim();
    var p = platforms[platform_];
    if (!p) {
        let name = await common.askPlatform();
        p = platforms[name];
        if (!p) {
            logs.logFatal(`Only support ${platforms} now.`);
            return;
        }
    }

    const { config, configPathDiretory } = await configParse.parseConfigPromise(currentWorkingDir);

    try {
        var project = await configParse.askProjects(config, null);
    } catch (error) {
        logs.logFatal('Please write all `project` field as project name');
    }
    if (!project) {
        logs.logFatal('Please write all `project` field as project name');
        return;
    }
    const appcenter = project?.pgyer || project?.appcenter;
    const hasPgyer = !!project?.pgyer;
    if (!appcenter) {
        logs.logFatal('missing appcenter or pgyer');
        return;
    }
    const appInfo = appcenter[p];

    if (!appInfo) {
        logs.logFatal('missing appInfo');
        return;
    }

    const keys = Object.keys(appInfo)
    const filterKeys = keys.filter(key => {
        const value = appInfo[key];
        const valid = typeof value === 'object' && Object.keys(value).length > 0;
        if (hasPgyer) return valid;
        return valid && value.userName && value.appName && value.group;
    });

    if (filterKeys.length === 0) logs.logFatal("Please check your jj.config.json, Cannot find userName/appName/group");

    var key_ = await common.askSelectList(filterKeys, 'Group');
    const info = appInfo[key_]
    const channel = info?.channel;
    if (hasPgyer && channel) {
        var openLink = `https://www.pgyer.com/${channel}`;
        if (!channel) {
            logs.logFatal("missing channel");
            return;
        }
    }else {
        const vaild = info.userName && info.appName && info.group;
        if (!vaild) logs.logFatal("Please check your jj.config.json, Cannot find userName/appName/group");
        openLink = `https://install.appcenter.ms/users/${info.userName}/apps/${info.appName}/distribution_groups/${info.group}`
    }
    
    logs.logFriendly("Your app link: " + openLink);
    await common.openUrl(openLink);

}


module.exports = {
    applink
}