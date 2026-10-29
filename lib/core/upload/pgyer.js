const common = require('../../untils/common');
const logs = require('../../untils/logs');
const { uploadToPgyer, getNextVerion, updateInfo, clearAllVersions, getAllVerions } = require('../../untils/pgyer-api');
const { getSizeByPath } = require('../../untils/fs');
const { post: httpPost } = require('../../untils/http');

// Compare dotted versions; returns the LARGER one ("" loses).
const largerVersion = (a, b) => {
    if (!a) return b || '';
    if (!b) return a;
    const pa = String(a).split('.').map(Number);
    const pb = String(b).split('.').map(Number);
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
    const parts = String(v || '1.0.0').split('.').map(Number);
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
    return parts.join('.');
}

// Fetch page 1 of a pgyer channel ONLY. Versions are CI-monotonic, so the
// global max is always among the latest 25 uploads — pulling every page
// costs seconds per channel for no practical benefit.
const fetchPgyerPage1 = async (apiKey, appKey) => {
    const url = 'https://www.pgyer.com/apiv2/app/builds';
    const first = await httpPost(url, { _api_key: apiKey, appKey, page: 1 });
    return ((first && first.data && first.data.list) || []).slice();
};

// Latest buildVersion on pgyer for one platform across ALL env channels.
// PERF: env channels very often share the SAME appKey — dedupe first, then
// fetch each unique channel CONCURRENTLY (page 1 only).
const getPgyerLatestAll = async (platform, project, config) => {
    const pgyer = (project && project.pgyer) || {};
    const pgyObject = pgyer[platform];
    if (!pgyObject) return '';
    const unique = new Map(); // appKey -> apiKey
    Object.keys(pgyObject).forEach((k) => {
        const info = pgyObject[k];
        if (!info || typeof info !== 'object' || Object.keys(info).length === 0) return;
        const apiKey = info.apiKey || pgyer.apiKey || config.defaultPgyerApiKey;
        const appKey = info.appKey;
        if (apiKey && appKey && !unique.has(appKey)) unique.set(appKey, apiKey);
    });
    if (unique.size === 0) return '';
    const lists = await Promise.all(
        [...unique.entries()].map(async ([appKey, apiKey]) => {
            try {
                return await fetchPgyerPage1(apiKey, appKey);
            } catch (error) { return []; }
        }),
    );
    let max = '';
    lists.forEach((list) => list.forEach((v) => {
        if (v && v.buildVersion) max = largerVersion(max, String(v.buildVersion));
    }));
    return max;
}

// SINGLE SOURCE OF TRUTH for the next version:
//   base = GLOBAL max across platforms, envs and sources (R2 + pgyer all channels)
//   no data anywhere -> "1.0.0"; then bump per env rule (prd: minor+1/patch=0).
const getNextVersion = async (platform, project, config, env) => {
    const { createR2Client, resolveR2Token, DEFAULT_R2_ENDPOINT } = require('../../untils/r2-api');
    const e = (() => {
        let x = String(env || '').toLowerCase();
        if (x === 'phase2uat' || x === 'uatphase2') return 'uat';
        if (x.includes('v4')) x = x.replace('v4', '');
        return x;
    })();

    // Kick off BOTH sources in parallel.
    const pgyerLatestPromise = (async () => {
        const [pa, pi] = await Promise.all([
            getPgyerLatestAll('android', project, config),
            getPgyerLatestAll('ios', project, config),
        ]);
        return largerVersion(pa, pi);
    })();

    let r2Latest = '';
    const token = resolveR2Token();
    if (token) {
        try {
            const client = createR2Client(DEFAULT_R2_ENDPOINT, token);
            // ONE call with platform=all: backend scans both platforms
            // in a single loadBuilds fan-out (half the round-trips).
            const rsp = await client.nextVersion(project.name, 'all').catch(() => null);
            const cur = rsp && rsp.code === 200 && rsp.json ? rsp.json.currentVersion : '';
            if (cur) r2Latest = String(cur);
        } catch (error) { /* R2 unavailable -> pgyer only */ }
    }

    const pgyerLatest = await pgyerLatestPromise;
    const base = largerVersion(r2Latest, pgyerLatest) || '1.0.0';
    const isPrd = e.includes('prd');
    console.log(bumpVersion(base, isPrd));
    process.exit(0);
}

// ---------------------------------------------------------------------------
// Legacy pgyer upload flow (unchanged)
// ---------------------------------------------------------------------------

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

module.exports = {
    pgyerUpload,
    getNextVersion
}
