const common = require('../../untils/common');
const logs = require('../../untils/logs');
const { commandExec } = require('../../untils/terminal');

const pgyerUpload = async (platform, appPath, project, config) => {
    if (!(await common.isInstalled('curl'))) {
        logs.logFatal('Please install curl first');
    }

    const pgyer = project && project.pgyer || {}
    const pgyObject = pgyer[platform.toLocaleLowerCase()];
    if (!pgyObject || Object.keys(pgyObject).length === 0) {
        logs.logFatal('Please set your pgy config');
    }

    const apiKey = pgyObject.apiKey || pgyer.apiKey || config.defaultPgyerApiKey;
    const userKey = pgyObject.userKey || pgyer.userKey || config.defaultPgyerUserKey;
    const buildPassword = pgyObject.buildPassword || pgyer.buildPassword;
    const appKey = pgyObject.appKey;
    const description = pgyObject.description;
    if (!apiKey || !userKey) {
        logs.logFatal('Please set your apiKey & userKey of pgy first.');
    }

    let msg = `
        Start Uploading...\n

        Upload To "pgy": (https://www.pgyer.com)\n
        Your Project name: ${project.name}\n
        Your App: ${appPath}\n
        `

    var command = `curl -F 'file=@${appPath}' -F '_api_key=${apiKey}' -F 'userKey=${userKey}' `;
    const command2 = "https://www.pgyer.com/apiv2/app/upload";
    if (buildPassword) {
        command += `-F 'buildPassword=${buildPassword}' `;
        msg += `
        Your Build Password: ${buildPassword} \n
        `
    }
    if (description) {
        command += `-F 'buildUpdateDescription=${description}' `;
        msg += `
        Your Description: ${description}\n
        `
    }
    command += command2;
    
    logs.green(msg);

    try {
        var result = await commandExec(command);
    } catch (error) {
        logs.logFatal(error);
        return;
    }

    if (typeof result === 'string') {
        try {
            result = JSON.parse(result);
        } catch (error) {
            throw error;
        }
    }

    // data: {
    //     buildKey: '50942b9668d62d473c4a2c3087e41d57',
    //     buildType: '2',
    //     buildIsFirst: '0',
    //     buildIsLastest: '1',
    //     buildFileKey: '2bafeee66c0256b30d3db630ec8367de.apk',
    //     buildFileName: 'app-debug.apk',
    //     buildFileSize: '14634411',
    //     buildName: 'MOS BURGER HK',
    //     buildVersion: '1.0.3',
    //     buildVersionNo: '1',
    //     buildBuildVersion: '7',
    //     buildIdentifier: 'com.mosburgersg.app',
    //     buildIcon: '73f58fb1ac3868025273d7b341781580',
    //     buildDescription: '',
    //     buildUpdateDescription: '',
    //     buildScreenshots: '',
    //     buildShortcutUrl: 'M2Bw',
    //     buildCreated: '2021-11-01 21:39:31',
    //     buildUpdated: '2021-11-01 21:39:31',
    //     buildQRCodeURL: 'https://www.pgyer.com/app/qrcodeHistory/591805b6d574583a97ca07314034703e8754ccbf0813f712b143ad1a03339fff'
    //   }
    const shortcutUrl = result && result.data && result.data.buildShortcutUrl;
    if (!shortcutUrl) {
        logs.logFriendly('Cannot return shortcutUrl: ', result);
        return;
    }
    logs.green('\n\n Upload Successful.\n');
    const openUrl = `https://www.pgyer.com/${shortcutUrl}`;
    await common.openUrl(openUrl);

}

module.exports = {
    pgyerUpload
}