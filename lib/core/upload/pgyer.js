const common = require('../../untils/common');
const logs = require('../../untils/logs');
const { uploadToPgyer, getNextVerion, updateInfo, clearAllVersions } = require('../../untils/pgyer-api');
const { getSizeByPath } = require('../../untils/fs');

const pgyerUpload = async (platform, appPath, project, config, closedfolder, env, notes) => {

    const pgyer = project && project.pgyer || {}
    let pgyObject = pgyer[platform.toLocaleLowerCase()];

    if (!env) {
        const keys = Object.keys(pgyObject)
        if (keys.length === 0) {
            logs.logFatal('Cannot find your appcenter config at jj.config.json')
            return;
        }
        const filterKeys = keys.filter(key => {
            const value = pgyObject[key];
            const vaild = typeof value === 'object' && Object.keys(value).length > 0;
            return vaild;
        });
        if (filterKeys.length === 0) logs.logFatal("Please check your jj.config.json, Cannot find pgyer group");
        env = await common.askSelectList(filterKeys, 'Group');
    }

    if (env == 'phase2uat' || env == 'uatphase2') env = 'uat';

    let _p =  pgyObject?.[`v4${env}`] || pgyObject?.[`${env}`]

    if ((!_p || Object.keys(_p).length === 0) && env.includes('v4')) {
        env = env.replace('v4', '');
        _p = pgyObject?.[`${env}`]
    }
    pgyObject = _p;


    if (!pgyObject || Object.keys(pgyObject).length === 0) {
        logs.logFatal('Please set your pgy config');
    }

    const apiKey = pgyObject.apiKey || pgyer.apiKey || config.defaultPgyerApiKey;
    // const userKey = pgyObject.userKey || pgyer.userKey || config.defaultPgyerUserKey;
    const buildPassword = pgyObject?.buildPassword || pgyer?.buildPassword;
    const appKey = pgyObject?.appKey;
    const channel = pgyObject?.channel;

    if (!apiKey || !appKey) {
        logs.logFatal('Please set your apiKey & appKey of pgy first.');
    }

    const size = await getSizeByPath(appPath);
    let msg = `
        Start Uploading...\n
        Upload To "pgy": (https://www.pgyer.com)\n
        Your Project name: ${project.name}\n
        Your App: ${appPath}\n
        Size: ${size}\n
        `
    if (buildPassword) {
        msg += `
        Your Build Password: ${buildPassword} \n
        `
    }
    logs.green(msg);

    try {
        var url = await uploadToPgyer(project.name, platform.toLocaleLowerCase(), apiKey, appPath, channel, notes, env)
        if (!url) {
            logs.logFatal('\n\n Upload Failure');
            return;
        }
        logs.green('\n\nUpload Successful. \n');
    } catch (error) {
        logs.logFatal('\n\n Upload Failure');
    }

    try {
        await updateInfo(apiKey, appKey, buildPassword)
    } catch (error) {

    }

    if (!closedfolder && url) await common.openUrl(url);
    process.exit(0);

}
const getNextVersion = async (platform, project, config, env) => {

    const pgyer = project && project.pgyer || {}
    let pgyObject = pgyer[platform.toLocaleLowerCase()];

    if (!env) {
        const keys = Object.keys(pgyObject)
        if (keys.length === 0) {
            logs.logFatal('Cannot find your appcenter config at jj.config.json')
            return;
        }
        const filterKeys = keys.filter(key => {
            const value = pgyObject[key];
            const vaild = typeof value === 'object' && Object.keys(value).length > 0;
            return vaild;
        });
        if (filterKeys.length === 0) logs.logFatal("Please check your jj.config.json, Cannot find pgyer group");
        env = await common.askSelectList(filterKeys, 'Group');
    }

    if (env == 'phase2uat' || env == 'uatphase2') env = 'uat';
    
    let _p =  pgyObject?.[`v4${env}`] || pgyObject?.[`${env}`]

    if ((!_p || Object.keys(_p).length === 0) && env.includes('v4')) {
        env = env.replace('v4', '');
        _p = pgyObject?.[`${env}`]
    }
    pgyObject = _p;
    if (!pgyObject || Object.keys(pgyObject).length === 0) {
        logs.logFatal('Please set your pgy config');
    }

    const apiKey = pgyObject.apiKey || pgyer.apiKey || config.defaultPgyerApiKey;
    const appKey = pgyObject?.appKey;

    if (!apiKey || !appKey) {
        logs.logFatal('Please set your apiKey & appKey of pgy first.');
    }

    try {

        clearAllVersions();
        var version = await getNextVerion(apiKey, appKey, env);
        console.log(version);
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }

}

module.exports = {
    pgyerUpload,
    getNextVersion
}