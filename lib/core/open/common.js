const path = require("path");
const fs = require("../../untils/fs");
const logs = require('../../untils/logs');
const common = require('../../untils/common');
const findPath = (platform, currentWorkingDir) => {
    var dirPath = "";
    const isAndroid = platform === 'android';
    if (fs.existsSync(path.join(currentWorkingDir, platform, isAndroid ? '' : 'App'))) {
        dirPath = path.join(currentWorkingDir, platform, isAndroid ? '' : 'App');
    } else if (fs.existsSync(path.join(currentWorkingDir, 'platforms', platform))) {
        dirPath = path.join(currentWorkingDir, 'platforms', platform);
    }
    return dirPath
}
exports.findPath = findPath;

async function findXcodePath(platform, currentWorkingDir) {
    try {
        const dirPath = findPath(platform, currentWorkingDir);
        if (dirPath) {
            const files = await fs.readdirAsync(dirPath);
            const xcodeProject = files.find(file => file.endsWith('.xcworkspace'));
            if (!xcodeProject) xcodeProject = files.find(file => file.endsWith('.xcodeproj'));
            if (xcodeProject) {
                return path.join(dirPath, xcodeProject);
            }
        }
        return null;
    }
    catch (_a) {
        return null;
    }
}
exports.findXcodePath = findXcodePath;

function getAndroidActions(platform, currentWorkingDir, setInfoCallback, androidStudioPath) {
    const path = findPath(platform, currentWorkingDir);
    if (!path) {
        throw new Error('Android project does not exist. Please add first.');
    }
    logs.logInfo(`Opening Android project at ${path}`);
    return new Map([
        ['darwin', async () => { // mac
            const opn = await Promise.resolve().then(() => require('open'));
            await opn(path, { app: { name: 'android studio' }, wait: false });
            setInfoCallback('opened');
            await common.wait(3000);
        }],
        ['win32', async () => {  // windows
            const open = await Promise.resolve().then(() => require('open'));
            if (!androidStudioPath) {
                androidStudioPath = 'C:\\Program Files\\Android\\Android Studio\\bin\\studio64.exe';
            }
            try {
                if (!fs.existsSync(androidStudioPath)) {
                    let commandResult = await runCommand('REG QUERY "HKEY_LOCAL_MACHINE\\SOFTWARE\\Android Studio" /v Path');
                    commandResult = commandResult.replace(/(\r\n|\n|\r)/gm, '');
                    const ix = commandResult.indexOf('REG_SZ');
                    if (ix > 0) {
                        androidStudioPath = commandResult.substring(ix + 6).trim() + '\\bin\\studio64.exe';
                    } else {
                        androidStudioPath = "";
                    }
                }
            } catch (e) {
                androidStudioPath = "";
            }
            if (androidStudioPath) {
                await open(path, { app: { name: androidStudioPath }, wait: false });
            } else {
                logs.logError('Unable to launch Android Studio. You must configure "androidStudioPath" ' +
                    'in -studio xxxxxx to point to the location of studio.sh, using JavaScript-escaped paths:\n' +
                    'Example: -studio C:\\Program Files\\Android\\Android Studio\\bin\\studio64.exe');
            }
        }],
        ['linux', async () => {  //linux
            const open = await Promise.resolve().then(() => require('open'));
            const linuxError = () => {
                logs.logError('Unable to launch Android Studio. You must configure "androidStudioPath" ' +
                    'in -studio xxxxxx to point to the location of studio.sh, using JavaScript-escaped paths:\n' +
                    'Example: -studio /usr/local/android-studio/bin/studio.sh');
            };
            if (!androidStudioPath) {
                androidStudioPath = '/usr/local/android-studio/bin/studio.sh';
            }
            try {
                if (fs.existsSync(androidStudioPath)) {
                    await open(path, { app: { name: androidStudioPath }, wait: false });
                } else {
                    linuxError();
                }
            }
            catch (e) {
                linuxError();
            }
        }],
    ]);
}

exports.getAndroidActions = getAndroidActions;