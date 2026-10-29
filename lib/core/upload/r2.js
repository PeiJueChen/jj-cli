/**
 * R2 upload flow (drop-in alternative of pgyerUpload in ./pgyer.js).
 * Triggered per project via jj.config.json:
 *   "r2": { "enabled": true, "envs": ["uat"], "endpoint": "...", "token": "..." }
 * When `envs` is empty/absent, ALL environments go to R2 (full migration).
 */

const fs = require('fs').promises;
const path = require('path');
const logs = require('../../untils/logs');
const common = require('../../untils/common');
const { getSizeByPath } = require('../../untils/fs');
const { createR2Client, uploadToR2, resolveR2Token, DEFAULT_R2_ENDPOINT, resolveCliqWebhook } = require('../../untils/r2-api');
const { extractAppInfo } = require('../../untils/app-info');

const UAT_ENV = "Env: uat";
const PRD_ENV = "Env: prd";

const getEnvString = (env) => {
    if (env) {
        env = env.toLocaleLowerCase();
        return (env.includes('uat') || env.includes('development') || env.includes('test')) ? UAT_ENV : PRD_ENV;
    }
    return "";
};

/**
 * Same description convention as the pgyer flow, so the frontend env filter
 * ("first line contains env") keeps working for both sources.
 */
const buildDescription = (env, notes) => {
    let desc = notes || "";
    if (env) {
        desc += `${env}:\n`;
        desc += `${getEnvString(env)}\n`;
    }
    return desc;
};

/**
 * Append appByodVersion / branch info found in the nearest .app-versions.json
 * (ported from pgyer-api.js updateAppDesc, but resolved BEFORE commit so only
 * one API call is needed).
 */
const appendVersionExtras = async (currentWorkingDir, appName, env, version, desc) => {
    let currentPath = currentWorkingDir;
    while (currentPath !== path.parse(currentPath).root) {
        const targetFile = path.join(currentPath, '.app-versions.json');
        try {
            await fs.access(targetFile);
            const apps = JSON.parse((await fs.readFile(targetFile, 'utf8')) || '{}');
            const envData = (apps[appName] || {})[env] || [];
            const versionData = envData.find((item) => item.version === version);
            let result = desc;
            if (versionData?.appByodVersion) result += `\n* appByodVersion: ${versionData.appByodVersion}`;
            if (versionData?.branch) result += `\n* source: ${versionData.branch}`;
            return result;
        } catch (error) {
            currentPath = path.dirname(currentPath);
        }
    }
    return desc;
};

/** Cliq notification for CLIENT-side upload failures (version parsing,
 *  upload-url, PUT). Success and commit-stage failures are notified by the
 *  SERVER (functions R2_CLIQ_WEBHOOK) so every upload path is covered and
 *  nothing is double-notified. Best-effort: never masks the real error. */
const notifyCliqFailure = async (appId, platform, env, stage, reason) => {
    const webhook = resolveCliqWebhook();
    if (!webhook) return;
    try {
        const { post2 } = require('../../untils/http');
        const plat = String(platform || '?').toLowerCase() === 'ios' ? 'iOS' : 'Android';
        const en = String(env || " ? ").toUpperCase();
        const msg = [
            "**\uD83D\uDD34 " + (appId || " ? ") + " — upload failed**",
            "`" + plat + " \u00B7 " + en + "`",
            "**Stage:** " + stage,
            "**Reason:** `" + String(reason || "unknown error").slice(0, 200) + "`",
        ].join("\n");
        await post2(webhook, { text: msg });
    } catch (e) { /* never mask the real error */ }
};
const r2Upload = async (platform, appPath, project, config, closedfolder, env, notes, currentWorkingDir) => {
    const r2 = (project && project.r2) || {};
    const client = createR2Client(r2.endpoint || DEFAULT_R2_ENDPOINT, resolveR2Token());

    // Resolve env: interactive when not provided (same UX as pgyer flow).
    if (!env) {
        const pgyerGroups = (project.pgyer && project.pgyer[platform.toLowerCase()]) || {};
        let filterKeys = Object.keys(pgyerGroups).filter((key) =>
            pgyerGroups[key] && typeof pgyerGroups[key] === 'object');
        // App fully on R2 without pgyer config: offer r2.envs instead.
        if (filterKeys.length === 0 && Array.isArray(r2.envs) && r2.envs.length > 0) {
            filterKeys = [...r2.envs];
        }
        if (filterKeys.length === 0) logs.logFatal("Cannot resolve env, please pass -appcenter or add groups in jj.config.json");
        env = await common.askSelectList(filterKeys, 'Group');
    }
    if (env == 'phase2uat' || env == 'uatphase2') env = 'uat';
    if (env.includes('v4')) env = env.replace('v4', '');

    const appId = project.name;
    const originalName = path.basename(appPath);
    const size = await getSizeByPath(appPath);

    logs.green(`
        Start Uploading...\n
        Upload To "R2": (${client.base})\n
        Your Project name: ${appId}\n
        Your App: ${appPath}\n
        Size: ${size}\n
        `);

    // 1. Extract version info + icon from the package itself.
    const info = await common.runTask(`parsing package info...`, async () => {
        return extractAppInfo(platform.toLowerCase(), appPath, currentWorkingDir);
    });
    if (!info.version) {
        await notifyCliqFailure(appId, platform, env, 'version-parsing', 'Cannot resolve app version from the package');
        logs.logFatal(platform.toLowerCase() === 'ios'
            ? 'Cannot resolve app version. Tried: package Info.plist, config.xml (cordova), file name pattern. Include the version in the ipa file name.'
            : 'Cannot resolve app version. Tried: apk-sibling output-metadata.json, build.gradle (app/ platforms/android/app/ android/app/), config.xml (cordova), file name pattern. Add versionName to build.gradle or include the version in the file name.');
        return;
    }
    logs.logInfo(`version: ${info.version} (${info.buildNumber || 'n/a'}), icon: ${info.iconPath ? 'yes' : 'no'}`);

    let description = buildDescription(env, notes);
    description = await appendVersionExtras(currentWorkingDir, appId, env, info.version, description);

    // Canonical object name: {platform}_{env}_{version}_{4-char-random}.{ext}
    // (each upload lives in its own buildKey dir, so this is naming only —
    // duplicates can never overwrite each other).
    const ext = (path.extname(originalName).toLowerCase()
        || (platform.toLowerCase() === 'ios' ? '.ipa' : '.apk'));
    const fileName = `${platform.toLowerCase()}_${env}_${info.version}_${Math.random().toString(36).slice(2, 6)}${ext}`;

    try {
        // 2-4. Presign -> icon (optional) -> stream upload -> commit with iconKey.
        const meta = {
            appId,
            platform: platform.toLowerCase(),
            version: info.version,
            buildNumber: info.buildNumber,
            bundleId: info.bundleId,
            appName: info.appName || appId,
            fileName,
            env,
            description,
        };
        let build = null;
        await common.runTask(`${env} uploading...`, async () => {
            build = await uploadToR2(client, meta, appPath, info.iconPath);
        });
        try { if (info.iconPath) await fs.unlink(info.iconPath); } catch (e) { /* noop */ }

        var params__ = `app/${appId}?env=${env}&platform=${platform}`;
        var openLink = `https://pgyer-enhance.web.app/${encodeURIComponent(params__)}`;
        logs.green(`\n\nUpload Successful. buildKey: ${build.buildKey}`);
        logs.green(`Download Link: ${openLink}\n`);



        if (!closedfolder) await common.openUrl(openLink);
        process.exit(0);
    } catch (error) {
        const failMsg = String(error?.message || error);
        // commit-stage failures are notified server-side; skip to avoid duplicates.
        if (!failMsg.startsWith('commit-build')) {
            await notifyCliqFailure(appId, platform, env, 'upload', failMsg);
        }
        logs.logFatal(`\n\n Upload Failure: ${failMsg}`);
    }
};


module.exports = {
    r2Upload,
};
