/**
 * Cloudflare R2 client for the pgyer-enhance Cloud Functions endpoints.
 *
 * Upload flow (mirrors the backend functions/r2.js):
 *   1. POST /r2/upload-url   -> presigned PUT url + buildKey
 *   2. PUT   <uploadUrl>     -> stream the file directly to R2 (no server relay)
 *   3. POST /r2/commit-build -> verify + save metadata to Firestore
 *
 * All requests are plain https (no extra deps). Large files are streamed.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const R2RC_PATH = path.join(os.homedir(), '.jj-cli', 'r2.json');

// Default backend endpoint: stable, shared by every project.
// jj.config.json only overrides it if the backend ever moves.
const DEFAULT_R2_ENDPOINT = 'https://us-central1-aigensstoretest.cloudfunctions.net/appdownload';

/**
 * Resolve the R2 API token with a security-first priority chain:
 *   1. CLI argument:  -r2token=xxx / -r2token xxx / --r2token=xxx / --r2token xxx
 *   2. Environment:   JJ_R2_TOKEN  (CI secret friendly)
 *   3. Private file:  ~/.jj-cli/r2.json  ->  { "token": "xxx" }
 *
 * The token is NEVER read from jj.config.json or the remote deviceConfig,
 * because those can end up in public/shared places (this CLI is published
 * to npm). project.r2.token is intentionally ignored (action.js warns).
 */
let _cachedToken = null;
let _tokenResolved = false;
const resolveR2Token = () => {
    if (_tokenResolved) return _cachedToken;
    _tokenResolved = true;
    const argv = process.argv || [];
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        const inline = arg.match(/^-{1,2}r2token=(.+)$/);
        if (inline) { _cachedToken = inline[1]; return _cachedToken; }
        if (/^-{1,2}r2token$/.test(arg) && argv[i + 1] && !argv[i + 1].startsWith('-')) {
            _cachedToken = argv[i + 1];
            return _cachedToken;
        }
    }
    if (process.env.JJ_R2_TOKEN) { _cachedToken = process.env.JJ_R2_TOKEN; return _cachedToken; }
    try {
        const rc = JSON.parse(fs.readFileSync(R2RC_PATH, 'utf8'));
        _cachedToken = rc.token || '';
    } catch (error) { _cachedToken = ''; }
    return _cachedToken;
};


/**
 * Generic JSON request. Returns { code, json }.
 */
const requestJson = (url, { method = 'GET', body, headers } = {}) => {
    return new Promise((resolve, reject) => {
        const payload = body === undefined ? null : JSON.stringify(body);
        const options = {
            method,
            headers: {
                ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
                ...(headers || {}),
            },
            timeout: 30000,
        };
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                let json = null;
                try { json = data ? JSON.parse(data) : null; } catch (error) { /* keep null */ }
                resolve({ code: res.statusCode, json });
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(new Error('request timeout')); });
        if (payload) req.write(payload);
        req.end();
    });
};

/**
 * Stream a local file to a presigned PUT url.
 * The Content-Type header MUST match the one used when signing.
 */
const putFile = (url, filePath, contentType) => {
    return new Promise((resolve, reject) => {
        const stat = fs.statSync(filePath);
        const req = https.request(url, {
            method: 'PUT',
            headers: {
                'Content-Type': contentType || 'application/octet-stream',
                'Content-Length': stat.size,
            },
            timeout: 15 * 60 * 1000, // large ipa/apk uploads may take a while
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({ code: res.statusCode, size: stat.size });
                } else {
                    reject(new Error(`R2 upload failed (${res.statusCode}): ${data.slice(0, 300)}`));
                }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(new Error('upload timeout')); });
        fs.createReadStream(filePath).pipe(req);
    });
};

/**
 * Create an R2 api client bound to one backend endpoint.
 * @param {string} endpoint e.g. https://us-central1-xxx.cloudfunctions.net/appdownload
 * @param {string} token    the R2_API_TOKEN (x-api-key)
 */
const createR2Client = (endpoint, token) => {
    const base = String(endpoint || '').replace(/\/+$/, '');
    if (!base || !token) throw new Error('Missing R2 endpoint/token, please set them in jj.config.json (project.r2).');
    const apiKeyHeader = { 'x-api-key': token };

    const uploadUrl = (params) => requestJson(`${base}/r2/upload-url`, {
        method: 'POST', body: params, headers: apiKeyHeader,
    });

    const commitBuild = (params) => requestJson(`${base}/r2/commit-build`, {
        method: 'POST', body: params, headers: apiKeyHeader,
    });

    const updateBuild = (params) => requestJson(`${base}/r2/update-build`, {
        method: 'POST', body: params, headers: apiKeyHeader,
    });

    const deleteBuilds = (buildKeys) => requestJson(`${base}/r2/delete-builds`, {
        method: 'POST', body: { buildKeys }, headers: apiKeyHeader,
    });

    const nextVersion = (appId, platform, env) => {
        const q = `appId=${encodeURIComponent(appId)}&platform=${encodeURIComponent(platform)}`
            + (env ? `&env=${encodeURIComponent(env)}` : '');
        return requestJson(`${base}/r2/next-version?${q}`, { headers: apiKeyHeader });
    };

    return {
        base,
        uploadUrl,
        putFile,
        commitBuild,
        updateBuild,
        deleteBuilds,
        nextVersion,
    };
};

/**
 * Full upload: presign -> (optional icon) -> PUT file -> commit metadata.
 * meta: { appId, platform, version, fileName, env, appName, bundleId,
 *         description, buildNumber, contentType? }
 * iconPath (optional): local icon file, uploaded next to the build; its key is
 * attached to commit-build so no second round-trip is needed.
 * Returns committed build data or throws with a readable message.
 */
const uploadToR2 = async (client, meta, filePath, iconPath) => {
    const step1 = await client.uploadUrl({
        appId: meta.appId,
        platform: meta.platform,
        version: meta.version,
        fileName: meta.fileName,
        contentType: meta.contentType,
        env: meta.env,
    });
    if (step1.code !== 200 || !step1.json || !step1.json.uploadUrl) {
        throw new Error(`upload-url failed (${step1.code}): ${JSON.stringify(step1.json)}`);
    }
    const { buildKey, key, uploadUrl: presigned, headers } = step1.json;

    // Icon first (best-effort; it is stored in the same buildKey directory).
    let iconKey = null;
    if (iconPath) {
        iconKey = await uploadIconToR2(client, {
            appId: meta.appId, platform: meta.platform, version: meta.version,
            env: meta.env, buildKey, iconPath,
        });
    }

    // Stream the package with RETRY: transient "socket hang up" happens on
    // long cross-border PUTs; a retry with a FRESH presigned URL (new edge
    // connection) almost always succeeds. Re-sign the SAME key (same buildKey).
    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            await putFile(presigned, filePath, headers && headers['Content-Type']);
            lastError = null;
            break;
        } catch (error) {
            lastError = error;
            if (attempt < 3) {
                console.warn(`upload attempt ${attempt} failed (${error && error.message}), retrying...`);
                await new Promise((r) => setTimeout(r, attempt * 2000));
                try {
                    const re = await client.uploadUrl({
                        appId: meta.appId, platform: meta.platform, version: meta.version,
                        fileName: meta.fileName, contentType: meta.contentType,
                        env: meta.env, buildKey,
                    });
                    if (re.code === 200 && re.json && re.json.uploadUrl) presigned = re.json.uploadUrl;
                } catch (reSignError) { /* keep the previous URL */ }
            }
        }
    }
    if (lastError) throw lastError;

    const step3 = await client.commitBuild({
        buildKey,
        appId: meta.appId,
        platform: meta.platform,
        version: meta.version,
        fileName: meta.fileName,
        env: meta.env,
        appName: meta.appName,
        bundleId: meta.bundleId,
        description: meta.description,
        buildNumber: meta.buildNumber,
        iconKey: iconKey || undefined,
    });
    if (step3.code !== 200 || !step3.json || !step3.json.data) {
        throw new Error(`commit-build failed (${step3.code}): ${JSON.stringify(step3.json)}`);
    }
    return step3.json.data;
};

/**
 * Upload an icon extracted from the package, stored next to the build file.
 * Returns the icon key (to be passed to commit-build as iconKey) or null.
 */
const uploadIconToR2 = async (client, { appId, platform, version, env, buildKey, iconPath }) => {
    if (!iconPath || !fs.existsSync(iconPath)) return null;
    const fileName = `icon${path.extname(iconPath) || '.png'}`;
    const step1 = await client.uploadUrl({
        appId, platform, version, env, fileName, buildKey, contentType: 'image/png',
    });
    if (step1.code !== 200 || !step1.json || !step1.json.uploadUrl) return null;
    try {
        await putFile(step1.json.uploadUrl, iconPath, 'image/png');
    } catch (error) {
        return null; // icon is optional, never fail the whole upload
    }
    return step1.json.key;
};

/**
 * Resolve the Cliq notification webhook with the same privacy chain as the token:
 *   1. Environment: JJ_CLIQ_WEBHOOK (CI secret friendly)
 *   2. Private file: ~/.jj-cli/r2.json -> { "token": "...", "cliqWebhook": "..." }
 * NEVER read from jj.config.json — it can sync to the public remote deviceConfig.
 */
let _cliqWebhookCache = null;
const resolveCliqWebhook = () => {
  if (_cliqWebhookCache !== null) return _cliqWebhookCache;
  if (process.env.JJ_CLIQ_WEBHOOK) {
    _cliqWebhookCache = process.env.JJ_CLIQ_WEBHOOK;
    return _cliqWebhookCache;
  }
  try {
    const rc = JSON.parse(fs.readFileSync(R2RC_PATH, 'utf8'));
    _cliqWebhookCache = rc.cliqWebhook || '';
  } catch (error) {
    _cliqWebhookCache = '';
  }
  return _cliqWebhookCache;
};
module.exports = {
    R2RC_PATH,
    DEFAULT_R2_ENDPOINT,
    resolveR2Token,
    resolveCliqWebhook,
    requestJson,
    putFile,
    createR2Client,
    uploadToR2,
    uploadIconToR2,
};
