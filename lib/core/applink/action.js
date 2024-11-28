const logs = require('../../untils/logs');
const common = require('../../untils/common');
const { platforms } = require('../../constants/platforms');
const configParse = require('../../untils/parse-config');
const applink = async (platform, currentWorkingDir, getAppcenter) => {
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
    var appcenter = project?.pgyer || project?.appcenter;

    if (getAppcenter) appcenter = project?.appcenter;

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
        https://pgyer-enhance.web.app/app%2Fshake-shack%3Fenv%3Duat%26platform%3Dios
        var params__ = `app/${project.name}?env=${key_}&platform=${p}`;
        // var openLink = `https://www.pgyer.com/${channel}`;
        var openLink = `https://pgyer-enhance.web.app/${encodeURIComponent(params__)}`;
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