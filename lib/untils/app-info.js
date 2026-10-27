/**
 * Extract app info (version / build number / bundle id / app name) and the
 * launcher icon from an .ipa or .apk package.
 *
 * Primary: `app-info-parser` reads the package itself (binary
 * AndroidManifest.xml / Info.plist, works for binary plists too) and also
 * returns the real app icon.
 *
 * Fallbacks when the lib is unavailable or the package has no version:
 * - iOS:  XML Info.plist regex inside Payload/*.app + AppIcon*.png
 * - Android: sibling output-metadata.json -> build.gradle -> config.xml
 *   (cordova) -> version pattern in the file name; icon from mipmap.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const AdmZip = require('adm-zip');

let AppInfoParser = null;
try { AppInfoParser = require('app-info-parser'); } catch (error) { /* optional at runtime */ }

const ANDROID_ICON_DENSITIES = ['xxxhdpi', 'xxhdpi', 'xhdpi', 'hdpi', 'mdpi'];

const plistValue = (content, key) => {
    const re = new RegExp(`<key>${key}</key>\\s*<string>([^<]+)</string>`);
    const match = content && content.match(re);
    return match ? match[1] : '';
};

const readZipEntry = (zip, entryPath) => {
    try {
        const entry = zip.getEntry(entryPath);
        return entry ? zip.readFile(entry) : null;
    } catch (error) {
        return null;
    }
};

/** Write a buffer to a temp file, returns the temp path. */
const bufferToTempFile = (buffer, fileName) => {
    const tempPath = path.join(os.tmpdir(), `jj-cli-icon-${Date.now()}-${fileName}`);
    fs.writeFileSync(tempPath, buffer);
    return tempPath;
};

/** App label may be a string or an array of localized labels; take the first non-empty one. */
const firstLabel = (value) => {
    if (Array.isArray(value)) {
        const hit = value.find((item) => typeof item === 'string' && item.trim());
        return hit ? hit.trim() : '';
    }
    return value ? String(value).trim() : '';
};

/** Parse with the third-party lib (apk + ipa). Returns null on any failure. */
const parseWithLib = async (appPath) => {
    if (!AppInfoParser) return null;
    try {
        const parser = new AppInfoParser(appPath);
        const info = await parser.parse();
        let iconPath = null;
        if (info.icon) {
            try {
                const b64 = String(info.icon).replace(/^data:image\/\w+;base64,/, '');
                iconPath = bufferToTempFile(Buffer.from(b64, 'base64'), 'icon.png');
            } catch (error) { /* icon optional */ }
        }
        // apk manifest: versionName/versionCode/package + application.label (array);
        // ipa returns raw plist keys: CFBundleShortVersionString/CFBundleVersion/
        // CFBundleIdentifier/CFBundleDisplayName.
        return {
            version: String(info.versionName || info.CFBundleShortVersionString || ''),
            buildNumber: String(info.versionCode || info.CFBundleVersion || ''),
            bundleId: info.package || info.packageName || info.CFBundleIdentifier || '',
            appName: firstLabel(info.name)
                || firstLabel(info.applicationLabel)
                || firstLabel(info.application && info.application.label)
                || firstLabel(info.CFBundleDisplayName)
                || firstLabel(info.CFBundleName),
            iconPath,
        };
    } catch (error) {
        return null;
    }
};

/** Version from AGP's output-metadata.json / output.json next to the apk. */
const readSiblingMetadata = (appPath) => {
    const dir = path.dirname(appPath);
    const candidates = [path.join(dir, 'output-metadata.json'), path.join(dir, 'output.json')];
    for (const file of candidates) {
        try {
            if (!fs.existsSync(file)) continue;
            const meta = JSON.parse(fs.readFileSync(file, 'utf8'));
            const el = meta && meta.elements && meta.elements[0];
            if (el && (el.versionName || el.versionCode)) {
                return { version: String(el.versionName || ''), buildNumber: String(el.versionCode || '') };
            }
        } catch (error) { /* try next */ }
    }
    return null;
};

/** Version from build.gradle (covers studio / cordova / capacitor layouts,
 *  also searches up to 4 parent dirs of the project root). */
const readGradleVersion = (projectRoot) => {
    if (!projectRoot) return null;
    const roots = [projectRoot];
    let cur = projectRoot;
    for (let i = 0; i < 4; i++) {
        cur = path.dirname(cur);
        roots.push(cur);
    }
    const candidates = [];
    roots.forEach((r) => {
        candidates.push(
            path.join(r, 'app', 'build.gradle'),
            path.join(r, 'platforms', 'android', 'app', 'build.gradle'),
            path.join(r, 'android', 'app', 'build.gradle'),
            path.join(r, 'build.gradle'),
        );
    });
    for (const file of candidates) {
        try {
            if (!fs.existsSync(file)) continue;
            const content = fs.readFileSync(file, 'utf8');
            const vn = content.match(/versionName\s+['"]([^'"]+)['"]/);
            if (vn) {
                const vc = content.match(/versionCode\s+(\d+)/);
                return { version: vn[1], buildNumber: vc ? vc[1] : '' };
            }
        } catch (error) { /* try next */ }
    }
    return null;
};

/** Version from cordova/ionic config.xml (<widget ... version="x.y.z">). */
const readCordovaConfigVersion = (projectRoot) => {
    if (!projectRoot) return null;
    const roots = [projectRoot];
    let cur = projectRoot;
    for (let i = 0; i < 4; i++) {
        cur = path.dirname(cur);
        roots.push(cur);
    }
    for (const r of roots) {
        const file = path.join(r, 'config.xml');
        try {
            if (!fs.existsSync(file)) continue;
            const content = fs.readFileSync(file, 'utf8');
            const widget = content.match(/<widget[^>]*\sversion="([^"]+)"/);
            if (widget) {
                const code = content.match(/android-versionCode="(\d+)"/);
                return { version: widget[1], buildNumber: code ? code[1] : '' };
            }
        } catch (error) { /* try next */ }
    }
    return null;
};

/** Manual iOS fallback: XML Info.plist regex + AppIcon extraction. */
const extractIosInfo = (appPath) => {
    const zip = new AdmZip(appPath);
    const appEntry = (zip.getEntries() || []).find((e) =>
        e.entryName && e.entryName.startsWith('Payload/') && e.entryName.endsWith('.app/Info.plist'));
    if (!appEntry) return {};

    const plist = zip.readFile(appEntry).toString('utf8');
    let iconTempPath = null;
    const appDir = appEntry.entryName.replace('Info.plist', '');

    const preferred = `${appDir}AppIcon60x60@2x.png`;
    let iconBuffer = readZipEntry(zip, preferred);
    if (!iconBuffer) {
        const iconEntry = (zip.getEntries() || []).find((e) =>
            e.entryName && e.entryName.startsWith(appDir) && /AppIcon\d+.*\.png$/.test(e.entryName));
        iconBuffer = iconEntry ? zip.readFile(iconEntry) : null;
    }
    if (iconBuffer) iconTempPath = bufferToTempFile(iconBuffer, 'icon.png');

    return {
        version: plistValue(plist, 'CFBundleShortVersionString'),
        buildNumber: plistValue(plist, 'CFBundleVersion'),
        bundleId: plistValue(plist, 'CFBundleIdentifier'),
        appName: plistValue(plist, 'CFBundleDisplayName') || plistValue(plist, 'CFBundleName'),
        iconPath: iconTempPath,
    };
};

/** Manual Android fallback: mipmap icon + version chain. */
const extractAndroidInfo = (appPath, projectRoot) => {
    const zip = new AdmZip(appPath);
    let iconTempPath = null;

    for (const density of ANDROID_ICON_DENSITIES) {
        const entryName = `res/mipmap-${density}/ic_launcher.png`;
        const iconBuffer = readZipEntry(zip, entryName);
        if (iconBuffer) {
            iconTempPath = bufferToTempFile(iconBuffer, 'icon.png');
            break;
        }
    }
    if (!iconTempPath) {
        const iconEntry = (zip.getEntries() || []).find((e) =>
            e.entryName && /^res\/mipmap-[^/]+\/ic_launcher\.png$/.test(e.entryName));
        if (iconEntry) iconTempPath = bufferToTempFile(zip.readFile(iconEntry), 'icon.png');
    }

    const info = readSiblingMetadata(appPath)
        || readGradleVersion(projectRoot)
        || readCordovaConfigVersion(projectRoot)
        || {};

    let version = String(info.version || '');
    let buildNumber = String(info.buildNumber || '');

    if (!version) {
        const match = path.basename(appPath).match(/(\d+\.\d+(\.\d+)?)/);
        if (match) version = match[1];
    }

    return { version, buildNumber, bundleId: '', appName: '', iconPath: iconTempPath };
};

/**
 * @param {string} platform ios | android
 * @param {string} appPath package file path
 * @param {string} [projectRoot] project working dir (for gradle / config.xml fallbacks)
 * @returns {Promise<{version, buildNumber, bundleId, appName, iconPath}>}
 * iconPath points to a temp file; caller should delete it after upload.
 */
const extractAppInfo = async (platform, appPath, projectRoot) => {
    // 1. Third-party lib reads the package itself (binary manifest / plist).
    const libInfo = await parseWithLib(appPath);
    if (libInfo && libInfo.version) {
        // Lib found no icon? try the manual icon extraction before giving up.
        if (!libInfo.iconPath) {
            try {
                const manual = platform === 'ios'
                    ? extractIosInfo(appPath)
                    : extractAndroidInfo(appPath, projectRoot);
                if (manual && manual.iconPath) libInfo.iconPath = manual.iconPath;
            } catch (error) { /* icon optional */ }
        }
        return libInfo;
    }
    // 2. Manual fallback chain.
    try {
        if (platform === 'ios') {
            const info = extractIosInfo(appPath);
            if (info.version) return info;
            const fromConfig = readCordovaConfigVersion(projectRoot) || {};
            let version = fromConfig.version || '';
            if (!version) {
                // Last resort: version pattern in the file name (same as android).
                const match = path.basename(appPath).match(/(\d+\.\d+(\.\d+)?)/);
                if (match) version = match[1];
            }
            return { ...info, version, buildNumber: info.buildNumber || String(fromConfig.buildNumber || '') };
        }
        return extractAndroidInfo(appPath, projectRoot);
    } catch (error) {
        return { version: '', buildNumber: '', bundleId: '', appName: '', iconPath: null };
    }
};

module.exports = {
    extractAppInfo,
};
