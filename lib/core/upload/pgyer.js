const common = require('../../untils/common');
const logs = require('../../untils/logs');
const { uploadToPgyer, getNextVerion, updateInfo, clearAllVersions, getAllVerions } = require('../../untils/pgyer-api');
const { getSizeByPath } = require('../../untils/fs');

const UAT_ENV_S = 'Env: uat';
const PRD_ENV_S = 'Env: prd';
const getEnvStringLocal = (e) => {
    if (!e) return "";
    const x = String(e).toLowerCase();
    return (x.includes('uat') || x.includes('development') || x.includes('test')) ? UAT_ENV_S : PRD_ENV_S;
}

const pgyerUpload = async (platform, appPath, project, config, closedfolder, env, notes, currentWorkingDir) => {

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
    const userKey = pgyObject.userKey || pgyer.userKey || config.defaultPgyerUserKey;
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
        var appInfo = await uploadToPgyer(project.name, platform.toLocaleLowerCase(), apiKey, appPath, channel, notes, env, currentWorkingDir, userKey);
        var url = appInfo?.openLink || "";
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
// Compare dotted versions; returns the LARGER one ("" loses).
const largerVersion = (a, b) => {
    if (!a) return b || "";
    if (!b) return a;
    const pa = String(a).split(".").map(Number);
    const pb = String(b).split(".").map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const na = pa[i] || 0;
        const nb = pb[i] || 0;
        if (na > nb) return a;
        if (na < nb) return b;
    }
    return a;
}

// Bump rule: prd -> minor + 1, patch = 0 (1.2.3 -> 1.3.0); otherwise patch + 1
// with 100-carry (1.2.99 -> 1.3.0, 1.99.99 -> 2.0.0).
const bumpVersion = (v, isPrd) => {
    const parts = String(v || "1.0.0").split(".").map(Number);
    while (parts.length < 3) parts.push(0);
    if (isPrd) {
        parts[1] += 1;
        parts[2] = 0;
    } else {
        parts[2] += 1;
        if (parts[2] >= 100) {
            parts[2] = 0;
            parts[1] += 1;
            if (parts[1] >= 100) {
                parts[1] = 0;
                parts[0] += 1;
            }
        }
    }
    return parts.join(".");
}

// Latest buildVersion on pgyer for one platform across ALL env channels
// (each env key has its own appKey = a separate pgyer app; query them all,
//  merge, take the global max — no env filtering).
const getPgyerLatestAll = async (platform, project, config) => {
    const pgyer = (project && project.pgyer) || {};
    const pgyObject = pgyer[platform];
    if (!pgyObject) return "";
    const keys = Object.keys(pgyObject).filter(k =>
        typeof pgyObject[k] === 'object' && Object.keys(pgyObject[k]).length > 0);
    let max = '';
    for (const k of keys) {
        const apiKey = (pgyObject[k] && pgyObject[k].apiKey) || pgyer.apiKey || config.defaultPgyerApiKey;
        const appKey = pgyObject[k] && pgyObject[k].appKey;
        if (!apiKey || !appKey) continue;
        clearAllVersions();
        try {
            const list = await getAllVerions(apiKey, appKey);
            list.sort((a, b) => {
                const va = String(a?.buildVersion || '').split('.').map(Number);
                const vb = String(b?.buildVersion || '').split('.').map(Number);
                for (let i = 0; i < Math.max(va.length, vb.length); i++) {
                    const na = va[i] || 0, nb = vb[i] || 0;
                    if (na > nb) return -1;
                    if (na < nb) return 1;
                }
                return 0;
            });
            const top = list[0]?.buildVersion || '';
            if (top) max = largerVersion(max, String(top));
        } catch (error) { /* channel unavailable, skip */ }
    }
    return max;
}
// SINGLE SOURCE OF TRUTH for the next version:
//   base = GLOBAL max across platforms, envs and sources (R2 + pgyer all channels)
//   no data anywhere -> "1.0.0"; then bump per env rule.
const getNextVersion = async (platform, project, config, env) => {
    const { createR2Client, resolveR2Token, DEFAULT_R2_ENDPOINT } = require('../../untils/r2-api');
    const e = (() => {
        let x = String(env || '').toLowerCase();
        if (x === 'phase2uat' || x === 'uatphase2') return 'uat';
        if (x.includes('v4')) x = x.replace('v4', '');
        return x;
    })();

    // R2 latest across both platforms (any platform may carry the newest build).
    let r2Latest = '';
    const token = resolveR2Token();
    if (token) {
        try {
            const client = createR2Client(DEFAULT_R2_ENDPOINT, token);
            const rsps = await Promise.all([
                client.nextVersion(project.name, 'android').catch(() => null),
                client.nextVersion(project.name, 'ios').catch(() => null),
            ]);
            rsps.forEach((r) => {
                const cur = r && r.code === 200 && r.json ? r.json.currentVersion : '';
                if (cur) r2Latest = largerVersion(r2Latest, String(cur));
            });
        } catch (error) { /* R2 unavailable -> pgyer only */ }
    }

    // pgyer latest across BOTH platforms and ALL env channels (global max).
    const pgyerAndroid = await getPgyerLatestAll('android', project, config);
    const pgyerIos = await getPgyerLatestAll('ios', project, config);
    const pgyerLatest = largerVersion(pgyerAndroid, pgyerIos);
    const base = largerVersion(r2Latest, pgyerLatest) || '1.0.0';

    const isPrd = e.includes('prd');
    console.log(bumpVersion(base, isPrd));
    process.exit(0);
}

module.exports = {
    pgyerUpload,
    getNextVersion
}
