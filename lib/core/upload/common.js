const common = require('../../untils/common');
const { runSpawnCommand, runCommand, commandExec } = require('../../untils/terminal');
const CAPTURE = /\u001b\[((?:\d*;){0,5}\d*)m/g;
const logs = require('../../untils/logs');
const fs = require('../../untils/fs');
const common3 = require('../open/common');
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
    })
    groups_ = groups_.filter(f => !!f);

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
    if (!path) path = common3.findPath(platform, currentWorkingDir);
    if (!path) throw new Error(`Cann't Fond ${platform} Path`);
    let files = await fs.findFiles(path, platform === 'android' ? '.apk' : '.ipa', true);
    let extname = platform === 'ios' ? 'IPA' : 'APK';
    if (!files || files.length === 0) throw new Error(`Cann't Find Any ${extname} file`);
    const sourceFiles = files.map(f => f.shortPath + `  (${f.time})`);
    const file = await common.askSelectList(sourceFiles, 'File');
    if (!file) throw new Error("Your Choose Wrong!");
    const packageApp = files.find(f => {
        return file.startsWith(f.shortPath);
    })
    logs.logFriendly(`Your Choose: ${file}`);
    return packageApp;
}
async function uploadPlatform(platform, currentWorkingDir, notes, apppath) {

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

    if (notes) {
        logs.logFriendly(`Your Notes: ${notes}`);
        command = `${command} -r "${notes}"`;
    }

    try {
        await common.runTask(`${platform} uploading...`, async () => {
            await runSpawnCommand(command);
            logs.logInfo('~End~');
        })
    } catch (error) {
        throw error;
    }

    const openLink = `https://install.appcenter.ms/users/${userName}/apps/${appname}/distribution_groups/${group}`

    const opn = await Promise.resolve().then(() => require('open'));
    await opn(openLink, { wait: false });
}

exports.uploadPlatform = uploadPlatform;