
const { post } = require('./http');
const PGYERAppUploader = require('./PGYERAppUploader');
const common = require('./common');
const logs = require('./logs');

const UAT_ENV = "Env: uat";
const PRD_ENV = "Env: prd";
const host = "https://www.pgyer.com";

const getEnvString = (env) => {
    if (env) {
        env = env.toLocaleLowerCase();
        return (env.includes('uat') || env.includes('development') || env.includes('test')) ? UAT_ENV : PRD_ENV;
    }
    return "";
}


const uploadToPgyer = async (app, platform, apiKey, appPath, buildChannelShortcut, buildUpdateDescription, env) => {
    // const url = "https://www.pgyer.com/apiv2/app/getCOSToken";
    // const params = {
    //     "_api_key": defaultPgyerApiKey,
    //     "buildType": 'ipa',
    //     "buildUpdateDescription": "buildUpdateDescription",
    //     "buildChannelShortcut": "merchant-IOS-uat"
    // }
    const uploader = new PGYERAppUploader(apiKey);
    const uploadOptions = {
        filePath: appPath, // 上传文件路径
        log: true, // 显示 log
        // buildInstallType: 2, // 安装方式:  2 为密码安装
        // buildPassword: '123456' // 安装密码
    }
    if (buildChannelShortcut) uploadOptions['buildChannelShortcut'] = buildChannelShortcut;
    let desc = buildUpdateDescription || "";
    if (env) {
        desc += `\n\n${getEnvString(env)}`;
    }
    uploadOptions['buildUpdateDescription'] = desc;


    try {
        const rsp = await common.runTask(`${env} uploading...`, async () => {
            return await uploader.upload(uploadOptions);
        })
        console.log("result:", rsp?.data);
        // const buildShortcutUrl = buildChannelShortcut || rsp?.data?.buildShortcutUrl;
        var params__ = `app/${app}?env=${env}&platform=${platform}`;
        var openLink = `https://pgyer-enhance.web.app/${encodeURIComponent(params__)}`;
        console.log("Download Link:", openLink)
        return openLink;
    } catch (error) {
        
    }
    // const rsp = await uploader.upload(uploadOptions);
    // console.log("result:", rsp?.data);
    // const buildShortcutUrl = buildChannelShortcut || rsp?.data?.buildShortcutUrl;
    // console.log("Download Link:", host + "/" + buildShortcutUrl)
    // return host + "/" + buildShortcutUrl;
};

const delApp = async (apiKey, appKey) => {
    const url = host + "/apiv2/app/deleteApp";
    const rsp = await post(url, { _api_key: apiKey, appKey });
    console.log("delApp:", rsp);
}

const delVersion = async (apiKey, appKey, buildKey) => {
    const url = host + "/apiv2/app/buildDelete";
    const rsp = await post(url, { _api_key: apiKey, appKey, buildKey })
    console.log("delVersion:", rsp);
}

var allVersions = [];
const getAllVerions = async (apiKey, appKey, page) => {

    // https://www.pgyer.com/apiv2/app/builds?_api_key=0202f5206763d902070f95c7826cb794&appKey=f10fc35f8027b9674d3979977a9972d0&channelKey=88dc901e6112b228f0c62833706d7b06&page=1
    const url = host + "/apiv2/app/builds";
    if (!page) page = 1;

    try {
        var rsp = await post(url, { _api_key: apiKey, appKey, page })
    } catch (error) {

    }
    const list = rsp?.data?.list || [];

    const pageCount = rsp?.data?.pageCount;
    const currentPage = page;

    allVersions.push(...list);
    if (currentPage < pageCount) {
        await getAllVerions(apiKey, appKey, currentPage + 1);
    }
    const result = [...allVersions]
    return result;
}

const clearAllVersions = () => {
    allVersions = [];
}

const getNextVerion = async (apiKey, appKey, env) => {
    allVersions = [];
    const list = await getAllVerions(apiKey, appKey);
    const envStr = getEnvString(env);
    const rs = list.filter(version => {
        return version?.buildUpdateDescription?.includes(envStr);
    })

    if (rs.length === 0) return "";

    const compareVersions = (a, b) => {
        let versionA = a?.buildVersion?.split('.').map(Number);
        let versionB = b?.buildVersion?.split('.').map(Number);

        for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
            const numA = versionA[i] || 0;
            const numB = versionB[i] || 0;
            if (numA > numB) return -1;  // a 在前  
            if (numA < numB) return 1;   // b 在前  
        }

        // 如果 buildVersion 一样，比较 buildVersionNo  
        versionA = a?.buildVersionNo?.split('.').map(Number);
        versionB = b?.buildVersionNo?.split('.').map(Number);

        for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
            const numA = versionA[i] || 0;
            const numB = versionB[i] || 0;
            if (numA > numB) return -1;  // a 在前  
            if (numA < numB) return 1;   // b 在前  
        }

        return 0; // 相等  
    }

    rs.sort(compareVersions);

    const buildVersion = rs[0]?.buildVersion;
    let parts = buildVersion.split(".");
    let lastPart = parseInt(parts[parts.length - 1]);
    parts[parts.length - 1] = (lastPart + 1).toString();
    const newVersion = parts.join(".");
    return newVersion;
}


const updateInfo = async (apiKey, appKey, buildPassword) => {

    const url = host + "/apiv2/app/update";
    const params = { _api_key: apiKey, appKey, buildInstallType: 1, appLang: 2, buildVersionType: 2, appAutoSync: 2, appShowPgyerCopyright: 2, buildQrcodeShowAppIcon: 1, appFeedbackStatus: 2, }
    if (buildPassword) {
        params.buildInstallType = 2;
        params.buildPassword = buildPassword;
    }
    const rsp = await post(url, params)
    return rsp;
}


module.exports = {
    uploadToPgyer,
    delApp,
    delVersion,
    getAllVerions,
    getNextVerion,
    updateInfo,
    clearAllVersions
}