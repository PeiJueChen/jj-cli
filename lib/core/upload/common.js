const common = require('../../untils/common');
const { runSpawnCommand, runCommand, commandExec } = require('../../untils/terminal');
const CAPTURE = /\u001b\[((?:\d*;){0,5}\d*)m/g;
const logs = require('../../untils/logs');
const fs = require('../../untils/fs');
const configParse = require('../../untils/parse-config');
function parseGroups(groups) {
    if (!groups || typeof groups !== 'string') {
        return null;
    }
    groups = groups.replace(/\r\n/g, "") // 替換所有換行回車
    groups = groups.replace(/\n/g, ""); // 替換所有回車
    groups = groups.replace(/\s+/g, ""); // 替換所有空格
    groups = groups.replace(/\─/g, ""); // 替換所有空格
    groups = groups.replace(/\┌/g, "");
    groups = groups.replace(/\┬/g, "");
    groups = groups.replace(/\┐/g, "");

    groups = groups.replace(/\└/g, "");
    groups = groups.replace(/\┴/g, "");
    groups = groups.replace(/\┘/g, "");

    groups = groups.replace(/\├/g, "");
    groups = groups.replace(/\┼/g, "");
    groups = groups.replace(/\┤/g, "");
    groups = groups.replace(/\│/g, "--");

    let groups_ = groups.split('--') || [];

    groups_ = groups_.map(g => {
        g = g.replace(CAPTURE, "");
        return g;
    }).filter(f => !!f);
    // groups_ = groups_.filter(f => !!f);

    if (groups_ && groups_.length <= 2) return null;
    if (groups_.length % 2 !== 0) return null;
    groups_.splice(0, 2);
    let gResult = groups_.reduce((previousValue, currentValue, currentIndex, array) => {
        if (currentIndex % 2 === 0) {
            previousValue.push(currentValue)
        }
        return previousValue;

    }, [])
    return gResult || null;
}

async function getApps() {
    let apps
    try {
        logs.logInfo("Get Apps List...");
        apps = await runCommand('appcenter apps list');
    } catch (error) {
        // appcenter login
        if (typeof error === 'string' && ~error.indexOf('appcenter login')) {
            try {
                logs.logInfo('Please Login First');
                await runSpawnCommand('appcenter login');
            } catch (error) {
                throw error;
            }
            logs.logInfo("Get Apps List Again...");
            apps = await runCommand('appcenter apps list');
        } else {
            throw error;
        }
    }
    return apps;
}

exports.getApps = getApps;

async function getGroups(app) {
    let groups
    try {
        // logs.logInfo("get groups list...");
        groups = await runCommand(`appcenter distribute groups list --app "${app}"`);
    } catch (error) {
        throw error;
    }

    const groups_ = parseGroups(groups);
    return groups_;
}


async function findPackageApp(platform, currentWorkingDir, apppath) {
    let path = apppath;
    // if (!path) path = common3.findPath(platform, currentWorkingDir);
    // if (!path) throw new Error(`Cann't Find ${platform} Path`);
    if (!path) path = currentWorkingDir;
    let files = await fs.findFiles(path, platform === 'android' ? ['.apk', '.aab'] : '.ipa', true);
    let extname = platform === 'ios' ? 'IPA,AAB' : 'APK';
    if (!files || files.length === 0) throw new Error(`Cann't Find Any ${extname} file`);
    const sourceFiles = files.map(f => f.shortPath + ` [${f.size}]-(${f.time})`);
    var packageApp;
    if (sourceFiles.length === 1) {
        packageApp = files[0];
        logs.logFriendly(`Your App: ${packageApp.fullPath}`);
    } else {
        const file = await common.askSelectList(sourceFiles, 'File');
        if (!file) throw new Error("Your Choose Wrong!");
        packageApp = files.find(f => {
            return file.startsWith(f.shortPath);
        })
        logs.logFriendly(`Your Choose: ${file}`);
    }

    /*
    {
        fullPath: xxx
    }
    */
    return packageApp;
}

exports.findPackageApp = findPackageApp;

async function uploadPlatform(platform, currentWorkingDir, notes, apppath, closedfolder) {

    const packageApp = await findPackageApp(platform, currentWorkingDir, apppath);
    if (!packageApp) throw new Error("packageApp Wrong!");



    let apps = await getApps();

    if (typeof apps === 'string' && ~apps.indexOf('\n')) {
        apps = apps.split("\n").map(app => {
            return app.trim();
        });
    } else {
        throw new Error('Not found your app list');
    }
    let app = await common.askSelectList(apps, 'App');
    if (!app) {
        throw new Error("App Choose Wrong");
    }
    logs.logFriendly(`Your App: ${app}`);

    if (!~app.indexOf('/')) throw new Error("App Wrong");
    const appInfos = app.split('/');
    const userName = appInfos[0];
    const appname = appInfos[1];

    let groups_
    try {
        groups_ = await common.runTask(`Get Groups...`, async () => {
            return await getGroups(app);
        })
    } catch (error) {
        throw error;
    }
    // const groups_ = await getGroups(app);

    if (!groups_) {
        throw new Error('Groups Not Found, Please make sure you have set Groups in your appcenter project ');
    }

    let group = await common.askSelectList(groups_, 'Groups');
    logs.logFriendly(`Your Group: ${group}`);

    let command = `appcenter distribute groups publish --group "${group}" --file "${packageApp.fullPath}" --app "${app}"`

    let msg = `
    your user name: ${userName}\n
    your app name: ${appname}\n
    your group: ${group}\n
    your app path: ${packageApp.fullPath}\n
    `
    if (notes) {
        msg += `your notes: ${notes}\n`;
        command = `${command} -r "${notes}"`;
    }

    logs.blue(msg);

    try {
        await common.runTask(`${platform} uploading...`, async () => {
            await runSpawnCommand(command);
            logs.logInfo('~End~');
        })
    } catch (error) {
        throw error;
    }

    const openLink = `https://install.appcenter.ms/users/${userName}/apps/${appname}/distribution_groups/${group}`

    if (!closedfolder) await common.openUrl(openLink);
}
const uploadWithInfo = async ({
    platform,
    token,
    userName,
    appName,
    group,
    appPath,
    notes = "",
    closedfolder = false
}) => {
    let install = await common.isInstalled('appcenter');
    if (!install) logs.logFatal(`Not found "appcenter", Please install first: 'npm install -g appcenter-cli'. ref: https://www.npmjs.com/package/appcenter-cli`);

    if (!token || !userName || !appName || !group || !appPath) logs.logFatal("Missing token/userName/appName/group/appPath")
    if (!fs.existsSync(appPath)) {
        logs.logFatal(`Cannot find your: ${appPath}`)
    }
    let msg = `
    your user name: ${userName}\n
    your app name: ${appName}\n
    your group: ${group}\n
    your app path: ${appPath}\n
    `
    const fullApp = `${userName}/${appName}`
    let command = `appcenter distribute groups publish --group "${group}" --file "${appPath}" --app "${fullApp}" --token ${token}`

    if (notes) {
        msg += `your notes: ${notes}\n`;
        command = `${command} -r "${notes}"`;
    }
    logs.blue(msg);

    try {
        logs.logFriendly("Begin upload app to appCenter")
        await common.runTask(`${platform} uploading...`, async () => {
            await runSpawnCommand(command);
            logs.logInfo('~End~');
        })
    } catch (error) {
        throw error;
    }

    const openLink = `https://install.appcenter.ms/users/${userName}/apps/${appName}/distribution_groups/${group}`

    if (!closedfolder) await common.openUrl(openLink);

}
exports.uploadWithInfo = uploadWithInfo;

exports.uploadPlatform = uploadPlatform;