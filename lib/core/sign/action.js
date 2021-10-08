const logs = require('../../untils/logs');
const fs = require('../../untils/fs');
const format = require('../../untils/format');
const common = require('../../untils/common');
const signPlatforms = require('../../constants/platforms');
const { runCommand, commandExec } = require('../../untils/terminal');
const path = require('path');

const configName = "sign.config.json"
const windowDefaultConfig = "C:\\Users\\aigens-pc\\Desktop\\Android-sign\\sign.config.json";
const macDefaultConfig = "/Users/chenpeijue/Desktop/Android-sign/sign.config.json";
var currentDir;
var openDir;
var projectName;

const signPlatform = async (platform, currentWorkingDir, cliBinDir, projectname) => {
    currentDir = currentWorkingDir;
    openDir = currentWorkingDir;
    projectName = projectname;
    const platform_ = platform && platform.toLowerCase().trim();
    var p = signPlatforms[platform_];
    if (!p) {
        logs.logFatal(`Only support ${Object.keys(signPlatforms)} now.`);
        return;
    }

    let actions = new Map([
        ['ios', async () => {

        }],
        ['android', async () => {
            await sign(p);
        }],
    ]);

    const action = actions.get(platform);
    action && action();

}

const fileIsExist = (file) => {
    if (!file) logs.logFatal(`Missing file`);
    const filePath = path.resolve(currentDir, ...(file.split('/')));
    const isExist = fs.existsSync(filePath);
    if (!isExist) logs.logFatal(`Cannot find file: ${file}`);
    return filePath;
}

const setUnsignPath = (config) => {
    const file = config.unsignedApk;

    var filePath = path.resolve(openDir, "app-release-unsigned.apk");
    isExist = filePath && fs.existsSync(filePath);
    if (!isExist) {
        filePath = path.isAbsolute(file) && path.resolve(file) || null;
        isExist = filePath && fs.existsSync(filePath);
    }
    if (!isExist) {
        filePath = path.resolve(currentDir, ...(file.split('/')));
        var isExist = fs.existsSync(filePath);
    }
    if (!isExist) logs.logFatal(`Cannot find app-release-unsigned.apk`);

    config.unsignedApk = filePath;
}

const parseConfig = async () => {
    let configPath = path.resolve(currentDir, configName);
    const isExist = fs.existsSync(configPath)
    if (!isExist) {
        // to default holder to find 
        configPath = process.platform === 'win32' ? windowDefaultConfig : process.platform === 'darwin' ? macDefaultConfig : '';
        if (!configPath || !fs.existsSync(configPath)) logs.logFatal('Cannot find sign config file');

        currentDir = path.join(configPath, '../');
    }
    var config = await fs.readFileContentAsync(configPath);
    if (!config) logs.logFatal(`${configName} is empty.`);
    if (typeof config === 'string') config = JSON.parse(config);

    setUnsignPath(config);

    return config;
}

const askProjects = async (config) => {
    const allProjects = config.projects || [];

    if (projectName) {
        const projectTemp = allProjects.find(p => ~p.project.indexOf(projectName))
        if (projectTemp) return projectTemp;
    }

    const projects = allProjects.map(p => p && p.project || "")
    const ps = projects.some(p => !p)
    if (ps) logs.logFatal('Please write all `project` field as project name');
    const project = await common.askSelectList(projects, 'Project');
    return allProjects.find(p => p.project === project)
}

const genSignedPath = async (keystorePath, project) => {
    const name = project && project.project;
    const outPath = path.join(keystorePath, "../", "signedApks");
    await fs.mkdirAsyncRecursive(outPath);
    const date = format.formatDate(new Date().getTime(), 'yyyy-MM-dd-[hh-mm-ss]');
    const outName = `${name}-signed-${date}.apk`
    return path.resolve(outPath, outName)
}

const rmTempApk = (path) => {
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
}

const genTempPath = (signedPath, name) => {
    const pathTmp = path.join(signedPath, '../', `${name}-unsigned-temp.apk`)
    rmTempApk(pathTmp);
    return pathTmp;
}

async function sign(platform) {

    // find config file
    if (!(await common.isInstalled('jarsigner'))) {
        logs.logFatal('Cannot find `jarsigner`');
    }
    if (!(await common.isInstalled('zipalign'))) {
        logs.logFatal('Cannot find `zipalign`');
    }

    const config = await parseConfig();

    const unsignedApkPath = config.unsignedApk;
    // const unsignedApkPath = fileIsExist(unsignedApk);

    const project = await askProjects(config);

    logs.logFriendly(`Your Project is : ${project.project}`)

    const keystoreFile = project.keyStoreFile
    const keystorePath = fileIsExist(keystoreFile);

    const alias = project.alias || config.defaultAlias;
    if (!alias) logs.logFatal('Cannot find alias');

    const storepass = project.storepass || project.keypass
    const keypass = project.keypass || project.storepass
    if (!storepass || !keypass) logs.logFatal('Cannot find storepass / keypass');

    const signedPath = await genSignedPath(keystorePath, project);
    const tempPath = genTempPath(signedPath, project.project);
    console.log("JJ ~ file: action.js ~ line 126 ~ sign ~ genTempPath", tempPath);

    try {
        logs.blue("................... Zipalign Start ...................")
        await commandExec(`zipalign -v -p 4 ${unsignedApkPath} ${tempPath}`);
        logs.blue("................... Zipalign End ...................")

        logs.blue("................... Sign Start ...................")
        await commandExec(`jarsigner -verbose -keystore ${keystorePath} -storepass ${storepass} -keypass ${keypass} -signedjar ${signedPath} ${tempPath} ${alias}`);
        rmTempApk(tempPath);
        logs.blue("................... Sign End ...................")
        logs.green(`Signed ${project.project}`)
        const opn = await Promise.resolve().then(() => require('open'));
        await opn(path.join(signedPath, "../"), { wait: false });
    } catch (error) {
        logs.logError(error);
    }

    // zipalign -v -p 4 app-release-unsigned.apk app-release-unsigned-temp.apk
}

module.exports = {
    signPlatform
}