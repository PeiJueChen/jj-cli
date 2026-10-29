const logs = require('../../untils/logs');
const common = require('../../untils/common');
const common2 = require('./common');
const { runSpawnCommand } = require('../../untils/terminal');
const configParse = require('../../untils/parse-config');
const signAction = require('./../sign/action');
const { pgyerUpload, getNextVersion } = require('./pgyer');
const { r2Upload } = require('./r2');
const { resolveR2Token, DEFAULT_R2_ENDPOINT } = require('../../untils/r2-api');
const platforms = {
    ios: 'ios',
    android: 'android'
}
var projectName;
var currentConfigDir;

/**
 * Progressive R2 migration switch.
 * jj.config.json per project: "r2": { "enabled": true, "envs": ["uat"], ... }
 * - No r2 block / enabled=false  -> everything goes to pgyer (unchanged).
 * - envs empty/absent            -> ALL envs go to R2 (full migration).
 * - envs = ["uat"]               -> only listed envs go to R2, others stay on pgyer.
 */
/**
 * Normalize env aliases the same way the pgyer flow does, so the r2.envs
 * whitelist matches "v4uat" / "phase2uat" style CI inputs too.
 */
const normalizeEnv = (env) => {
    if (!env) return env;
    let e = String(env).toLowerCase();
    if (e === 'phase2uat' || e === 'uatphase2') return 'uat';
    if (e.includes('v4')) e = e.replace('v4', '');
    return e;
};

const shouldUseR2 = (project, env) => {
    const r2 = project && project.r2;
    if (!r2 || r2.enabled === false) return false;
    // endpoint has a built-in default; config only overrides when moved.
    if (!r2.endpoint && !DEFAULT_R2_ENDPOINT) return false;
    // SECURITY: token never comes from jj.config.json / remote deviceConfig
    // (this CLI is public on npm). Read it via -r2token / JJ_R2_TOKEN /
    // ~/.jj-cli/r2.json instead. A token left in config is ignored.
    if (r2.token) {
        logs.logWarn('project.r2.token in jj.config.json is IGNORED for security. Use -r2token=xxx, JJ_R2_TOKEN env or ~/.jj-cli/r2.json');
    }
    if (!resolveR2Token()) return false;
    const e = normalizeEnv(env);
    if (!e) return true;
    if (!Array.isArray(r2.envs) || r2.envs.length === 0) return true;
    return r2.envs.some((item) => normalizeEnv(item) === e);
};

const uploadApp = async (platform, currentWorkingDir, cliBinDir, notes, apppath, projectname, folderpath, appcenter, closedfolder) => {
    projectName = projectname;
    currentConfigDir = folderpath || currentWorkingDir;
    let install = await common.isInstalled('appcenter');
    if (!install) logs.logFatal(`Not found "appcenter", Please install first: 'npm install -g appcenter-cli'. ref: https://www.npmjs.com/package/appcenter-cli`);

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

    try {
        // upload with config file
        const { config, configPathDiretory } = await configParse.parseConfigPromise(currentConfigDir);
        const app = await common2.findPackageApp(p, currentWorkingDir, apppath);
        const appPath_ = app && app.fullPath;

        try {
            var project = await configParse.askProjects(config, projectName);
        } catch (error) {
            logs.logFatal('Please write all `project` field as project name');
        }

        let hasPgyer = hasObject(project.pgyer);
        let hasAppcenter = hasObject(project.appcenter);
        if (!hasPgyer && !hasAppcenter) {
            logs.logFatal('Cannot find your pgyer or appcenter config');
        }

        // R2 first (progressive migration per project / per env).
        if (shouldUseR2(project, appcenter)) {
            await r2Upload(p, appPath_, project, config, closedfolder, appcenter, notes, currentWorkingDir);
            return;
        }

        // if (hasPgyer && hasAppcenter) {
        //     const website = await common.askSelectList(['pgyer', 'appcenter'], "Website");
        //     hasPgyer = website === 'pgyer';
        //     hasAppcenter = website === 'appcenter'
        // }

        if (hasPgyer) {
            await pgyerUpload(p, appPath_, project, config, closedfolder, appcenter, notes, currentWorkingDir);
            return;
        }

        if (hasAppcenter) {
            await signAction.uploadToAppcenter(appPath_, project.appcenter, p, config.defaultAppcenterToken, appcenter, closedfolder)
        }


    } catch (error) {
        common2.uploadPlatform(p, currentWorkingDir, notes, apppath, closedfolder);
    }

}

const payerGetVersion = async (platform, currentWorkingDir, cliBinDir, notes, apppath, projectname, folderpath, appcenter, closedfolder) => {
    projectName = projectname;
    currentConfigDir = folderpath || currentWorkingDir;

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

    try {
        // upload with config file
        const { config, configPathDiretory } = await configParse.parseConfigPromise(currentConfigDir);

        try {
            var project = await configParse.askProjects(config, projectName);
        } catch (error) {
            logs.logFatal('Please write all `project` field as project name');
        }

        let hasPgyer = hasObject(project.pgyer);
        let hasAppcenter = hasObject(project.appcenter);
        if (!hasPgyer && !hasAppcenter) {
            logs.logFatal('Cannot find your pgyer or appcenter config');
        }

        if (hasPgyer) {
            await getNextVersion(p, project, config, appcenter);
            return;
        }

    } catch (error) {
    }
}

const hasObject = (object) => {
    return object && Object.keys(object).length > 0;
}

const logoutAppcenter = async () => {
    let install = await common.isInstalled('appcenter');
    if (!install) logs.logFatal(`Not found "appcenter", Please install first: 'npm install -g appcenter-cli'. ref: https://www.npmjs.com/package/appcenter-cli`);
    try {
        await common.runTask(`logout...`, async () => {
            await runSpawnCommand('appcenter logout');
            logs.logInfo('~End~');
        })
    } catch (error) {
        throw error;
    }
}
const loginAppcenter = async () => {
    let install = await common.isInstalled('appcenter');
    if (!install) logs.logFatal(`Not found "appcenter", Please install first: 'npm install -g appcenter-cli'. ref: https://www.npmjs.com/package/appcenter-cli`);
    try {
        await common.runTask(`login...`, async () => {
            await runSpawnCommand('appcenter login');
            logs.logInfo('~End~');
        })
    } catch (error) {
        throw error;
    }
}
module.exports = {
    uploadApp,
    logoutAppcenter,
    loginAppcenter,
    payerGetVersion
}