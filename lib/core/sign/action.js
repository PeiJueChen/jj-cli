const logs = require('../../untils/logs');
const fs = require('../../untils/fs');
const configParse = require('../../untils/parse-config');
const format = require('../../untils/format');
const common = require('../../untils/common');
const { signPlatforms } = require('../../constants/platforms');
const { runCommand, commandExec } = require('../../untils/terminal');
const path = require('path');
const uploadCommon = require('./../upload/common');
const DEFAULT_APPCENTER_TOKEN = "cc08d0408403c04968bcfbf738a7356bf6f4c8be"
var currentDir;
var openDir;
var projectName;
var appcenterEnvironment;
var Platform;

const signPlatform = async ({ platform, currentWorkingDir, cliBinDir, projectname, folderpath, appcenter }) => {
    currentDir = folderpath || currentWorkingDir;
    openDir = currentWorkingDir;
    projectName = projectname;
    appcenterEnvironment = appcenter;
    const platform_ = platform && platform.toLowerCase().trim();
    var p = signPlatforms[platform_];
    if (!p) {
        logs.logFatal(`Only support ${Object.keys(signPlatforms)} now.`);
        return;
    }

    let actions = new Map([
        ['ios', async () => {

        }],
        ['android', async () => {
            await sign();
        }],
    ]);

    Platform = p;
    const action = actions.get(p);
    action && action();

}

const fileIsExist = (file) => {
    if (!file) logs.logFatal(`Missing file`);
    const filePath = path.resolve(currentDir, ...(file.split('/')));
    const isExist = fs.existsSync(filePath);
    if (!isExist) logs.logFatal(`Cannot find file: ${file}`);
    return filePath;
}

const setUnsignPath = (config) => {
    const file = config.unsignedApk;

    var filePath = path.resolve(openDir, "app-release-unsigned.apk");
    isExist = filePath && fs.existsSync(filePath);
    if (!isExist) {
        filePath = path.isAbsolute(file) && path.resolve(file) || null;
        isExist = filePath && fs.existsSync(filePath);
    }
    if (!isExist) {
        filePath = path.resolve(currentDir, ...(file.split('/')));
        var isExist = fs.existsSync(filePath);
    }
    if (!isExist) logs.logFatal(`Cannot find app-release-unsigned.apk`);

    config.unsignedApk = filePath;
}

const parseConfig = async () => {
    const { config, configPathDiretory } = await configParse.parseConfig(currentDir);
    currentDir = configPathDiretory;
    setUnsignPath(config);
    return config;
}

const askProjects = async (config, projectName) => {
    try {
        const project = await configParse.askProjects(config, projectName)
        return project;
    } catch (error) {
        logs.logFatal('Please write all `project` field as project name');
    }
}


const genSignedPath = async (keystorePath, project) => {
    const name = project && project.name;
    const outPath = path.join(keystorePath, "../", "signedApks");
    await fs.mkdirAsyncRecursive(outPath);
    const date = format.formatDate(new Date().getTime(), 'yyyy-MM-dd-[hh-mm-ss]');
    const outName = `${name}-signed-${date}.apk`
    return path.resolve(outPath, outName)
}

const rmTempApk = (path) => {
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
}

const genTempPath = (signedPath, name) => {
    const pathTmp = path.join(signedPath, '../', `${name}-unsigned-temp.apk`)
    rmTempApk(pathTmp);
    return pathTmp;
}

async function sign() {

    // find config file
    if (!(await common.isInstalled('jarsigner'))) {
        logs.logFatal('Cannot find `jarsigner`');
    }
    if (!(await common.isInstalled('zipalign'))) {
        logs.logFatal('Cannot find `zipalign`');
    }

    const config = await parseConfig();

    const unsignedApkPath = config.unsignedApk;
    // const unsignedApkPath = fileIsExist(unsignedApk);

    const project = await askProjects(config, projectName);

    logs.logFriendly(`Your Project is : ${project.name}`)

    const keystoreFile = project.keyStoreFile
    const keystorePath = fileIsExist(keystoreFile);

    const alias = project.alias || config.defaultAlias;
    if (!alias) logs.logFatal('Cannot find alias');

    const storepass = project.storepass || project.keypass
    const keypass = project.keypass || project.storepass
    if (!storepass || !keypass) logs.logFatal('Cannot find storepass / keypass');

    const signedPath = await genSignedPath(keystorePath, project);
    const tempPath = genTempPath(signedPath, project.name);

    try {
        logs.blue("................... Zipalign Start ...................")
        // zipalign -v -p 4 app-release-unsigned.apk app-release-unsigned-temp.apk
        await commandExec(`zipalign -v -p 4 ${unsignedApkPath} ${tempPath}`);
        logs.blue("................... Zipalign End ...................")
        logs.red("\n...........................................................................................\n")
        logs.blue("................... Sign Start ...................")
        await commandExec(`jarsigner -verbose -keystore ${keystorePath} -storepass ${storepass} -keypass ${keypass} -signedjar ${signedPath} ${tempPath} ${alias}`);
        rmTempApk(tempPath);
        logs.blue("................... Sign End ...................")
        logs.green(`Signed ${project.name}`)
        await common.openUrl(path.join(signedPath, "../"))

        // upload to appcenter
        uploadToAppcenter(signedPath, project.appcenter, Platform, config.defaultAppcenterToken)
    } catch (error) {
        logs.logError(error);
    }


}

const uploadToAppcenter = async (appPath, appcenter, platform_ = Platform, defaultToken = "", appcenterenvironment = appcenterEnvironment) => {
    if (!fs.existsSync(appPath)) {
        logs.logFatal(`Cannot find your: ${appPath}`)
    }
    appcenter = appcenter || {};
    const platform = appcenter[platform_] || {};
    const keys = Object.keys(platform)
    if (keys.length === 0) {
        logs.logFriendly('Cannot find your appcenter config at jj.config.json')
        return;
    }
    const appInfo = appcenterenvironment && platform[appcenterenvironment]
    var params;
    if (appInfo) {
        const vaild = appInfo.userName && appInfo.appName && appInfo.group;
        if (!vaild) logs.logFatal("Please check your jj.config.json, Cannot find userName/appName/group");
        params = {
            ...appInfo,
            token: appInfo.token || platform.token || appcenter.token || defaultToken || DEFAULT_APPCENTER_TOKEN,
            appPath,
            platform: platform_
        }
    } else {
        const filterKeys = keys.filter(key => {
            const value = platform[key];
            const vaild = typeof value === 'object' && Object.keys(value).length > 0;
            return vaild && value.userName && value.appName && value.group;
        });

        if (filterKeys.length === 0) logs.logFatal("Please check your jj.config.json, Cannot find userName/appName/group");

        logs.logFriendly("Upload app to appcenter");
        // if (filterKeys.length === 1) {
        //     key_ = filterKeys[0];
        // } else {
        //     var key_ = await common.askSelectList(filterKeys, 'Group');
        // }
        var key_ = await common.askSelectList(filterKeys, 'Group');
        const group = platform[key_];
        if (!group) logs.logFatal("Cannot find your Group info");
        params = {
            ...group,
            token: group.token || platform.token || appcenter.token || defaultToken || DEFAULT_APPCENTER_TOKEN,
            appPath,
            platform: platform_
        }
    }
    /*
    {
      userName: 'ming.lin.huang',
      appName: 'merchant-app-Google-Play-Store',
      group: 'All-users-of-merchant-app-Google-Play-Store',
      token: 'cc08d0408403c04968bcfbf738a7356bf6f4c8be',
      appPath: '/Users/chenpeijue/Desktop/Android-sign/projects/merchant/signedApks/merchant-signed-2021-10-10-[12-02-09].apk',
      platform: 'android'
    }
    */
    uploadCommon.uploadWithInfo(params);

}

module.exports = {
    signPlatform,
    uploadToAppcenter
}