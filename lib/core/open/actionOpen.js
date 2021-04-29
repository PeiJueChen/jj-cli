const logs = require('../../untils/logs');
const common = require('../../untils/common');
const platforms = {
    ios: 'ios',
    android: 'android'
}
const common2 = require('./common');
const openPlatform = async (platform, currentWorkingDir, cliBinDir, androidStudioPath) => {
    const platform_ = platform && platform.toLowerCase().trim();
    var p = platforms[platform_];
    if (!p) {
        let name = await common.askPlatform();
        p = platforms[name];
        if (!p) {
            logs.logFatal('Only support ios/android now.');
            return;
        }
    }

    await open(p, currentWorkingDir, androidStudioPath);

}
async function open(platform, currentWorkingDir, androidStudioPath) {
    let actions = new Map([
        ['ios', async () => {
            // const install = await common.isInstalled("xcodebuild");
            // const install2 = install && await common.isInstalled("xcode-select");
            // console.log("JJ ~ file: actionOpen.js ~ line 27 ~ ['ios', ~ install", install2);
            await common.runTask('Opening the Xcode workspace...', (setInfoCallback) => {
                return openiOS(platform, currentWorkingDir, setInfoCallback);
            })
        }],
        ['android', async () => {
            await common.runTask('Opening the Android Studio...', (setInfoCallback) => {
                return openAndroid(platform, currentWorkingDir, setInfoCallback, androidStudioPath);
            })
        }],
    ]);

    const action = actions.get(platform);
    action && action();
}

async function openiOS(platform, currentWorkingDir, setInfoCallback) {
    const xcodeProject = await common2.findXcodePath(platform, currentWorkingDir);
    if (xcodeProject) {
        const open = await Promise.resolve().then(() => require('open'));
        await open(xcodeProject, { wait: false });
        setInfoCallback('opened');
        await common.wait(3000);
    } else {
        throw new Error('Xcode workspace does not exist. ' +
            'Please add first.');
    }
}

async function openAndroid(platform, currentWorkingDir, setInfoCallback, androidStudioPath) {
    const actions = common2.getAndroidActions(platform, currentWorkingDir, setInfoCallback, androidStudioPath);
    const action = actions.get(process.platform);
    if (!action) {
        logs.logFatal('Not support system')
    }
    action && await action();
}

module.exports = {
    openPlatform
}