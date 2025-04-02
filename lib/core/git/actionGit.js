const { runSpawnCommand, commandExec, runCommand } = require('../../untils/terminal');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const bash = process.platform === 'win32' ? '' : 'bash ';
const path = require('path');
const common = require('../../untils/common');
const logs = require('../../untils/logs');
const format = require('../../untils/format');
const gpushAction = async (message, branch, depository) => {
    const isInstall = await common.isInstalled('git');
    if (!isInstall) {
        logs.logFatal('Please install GIT first.');
    }
    // const p = path.join(__dirname, '../../shell/push.sh');
    // var params = `"${message}" `;
    // params = `${params}"${branch || ""}"`;
    // if (depository) params = params + ` "${depository}"`;
    // await common.runTask("push...", async () => {
    //     // await commandExec(`${bash}${p} ${params}`);
    //     try {
    //         await runSpawnCommand(`${bash}${p} ${params}`);
    //         logs.logInfo('~End~');
    //     } catch (error) {
    //         logs.logError(error);
    //         process.exit(1);
    //     }
    // })

    if (!message) {
        logs.logFatal("Write your commit noted")
    }
    branch = branch || await getBranch();
    depository = depository || await getGitDepository();
    logs.logInfo(`Your branch is: ${branch}`);
    logs.logInfo(`Your depository is: ${depository}`);
    try {
        await common.runTask("add...", async () => { await runCommand(`git add .`); })
        await common.runTask("commit...", async () => { await runCommand(`git commit -m "${message}"`); })
        await common.runTask("push...", async () => { await runCommand(`git push ${depository} ${branch}`); })
        logs.logFriendly('Exec Done')
    } catch (error) {
        logs.logError(error);
    }

}

const gpullAction = async (branch, depository) => {

    const isInstall = await common.isInstalled('git');
    if (!isInstall) {
        logs.logInfo('Please install GIT first.');
        process.exit(1);
    }
    depository = depository || await getGitDepository();
    branch = branch || await getBranch();
    try {
        await common.runTask("fetch...", async () => { await runCommand(`git fetch ${depository} ${branch}`); })
        // await common.runTask("fetch...", async () => { await runCommand(`git fetch ${depository}`); })
        await common.runTask("pull...", async () => { await runCommand(`git pull ${depository} ${branch}`); })
    } catch (error) {
        logs.logError(error);
    }

}

const gtagAction = async (tagName, depository) => {
    const isInstall = await common.isInstalled('git');
    if (!isInstall) {
        logs.logFatal('Please install GIT first.');
    }
    depository = depository || await getGitDepository();
    const branch = await getBranch();
    const date = getDate();
    tagName = tagName || `${branch}-${date}`;
    try {
        await common.runTask("tag...", async () => { await runCommand(`git tag ${tagName}`); })
        await common.runTask("push...", async () => { await runCommand(`git push ${depository} ${tagName}`); })
    } catch (error) {
        logs.logError(error);
    }
}

const getBranch = async () => {
    try {
        var branch = await runCommand('git rev-parse --abbrev-ref HEAD');
    } catch (error) {
        branch = "master";
    }
    return branch.replace(/\n/g, "");
    ;
}
const getDate = async () => {
    return format.formatDate(new Date().getTime(), 'yyyy-MM-dd-hhmmss');
}

const getGitDepository = async () => {
    const depositoryStr = await runCommand('git remote -v');
    try {
        var depository = depositoryStr.split(' ')[0].split('\t')[0];
    } catch (error) {
        depository = "origin"
    }
    return depository
}

module.exports = {
    gpushAction,
    gpullAction,
    gtagAction
}
