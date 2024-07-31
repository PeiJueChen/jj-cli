const common = require('../../untils/common');
const logs = require('../../untils/logs');
const { uploadToPgyer, getNextVerion, updateInfo } = require('../../untils/pgyer-api');


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

    pgyObject = pgyObject?.[`v4${env}`] || pgyObject?.[`${env}`]


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

    let msg = `
        Start Uploading...\n
        Upload To "pgy": (https://www.pgyer.com)\n
        Your Project name: ${project.name}\n
        Your App: ${appPath}\n
        `
    if (buildPassword) {
        msg += `
        Your Build Password: ${buildPassword} \n
        `
    }
    logs.green(msg);

    try {
        var url = await uploadToPgyer(apiKey, appPath, channel, notes, env)
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

    pgyObject = pgyObject?.[`v4${env}`] || pgyObject?.[`${env}`]

    if (!pgyObject || Object.keys(pgyObject).length === 0) {
        logs.logFatal('Please set your pgy config');
    }

    const apiKey = pgyObject.apiKey || pgyer.apiKey || config.defaultPgyerApiKey;
    const appKey = pgyObject?.appKey;

    if (!apiKey || !appKey) {
        logs.logFatal('Please set your apiKey & appKey of pgy first.');
    }

    try {
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