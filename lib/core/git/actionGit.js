
const { runSpawnCommand, commandExec, runCommand } = require('../../untils/terminal');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const bash = process.platform === 'win32' ? '' : 'bash ';
const path = require('path');
const common = require('../../untils/common');
const logs = require('../../untils/logs');

const gpushAction = async (message, branch, depository) => {

    // console.log("message:", message, branch, depository);
    // console.log("JJ ~ file: action.js ~ line 3 ~ gpushAction ~ message", p);
    // commandSpawn(bash, [p], { shell: true, argv0: `${message} ` })
    const p = path.join(__dirname, '../../shell/push.sh');
    var params = `"${message}" `;
    params = `${params}"${branch || ""}"`;
    if (depository) params = params + ` "${depository}"`;
    await common.runTask("push...", async () => {
        // await commandExec(`${bash}${p} ${params}`);
        try {
            await runSpawnCommand(`${bash}${p} ${params}`);
            logs.logInfo('~End~');
        } catch (error) {
            logs.logError(error);
            process.exit(1);
        }
    })

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

const gpullAction = async (branch, depository) => {

    const isInstall = await common.isInstalled('git');
    if (!isInstall) {
        logs.logInfo('Please install GIT first.');
        process.exit(1);
    }
    depository = depository || await getGitDepository();
    branch = branch || await runCommand('git rev-parse --abbrev-ref HEAD') || 'master';
    try {
        await common.runTask("fetch...", async () => {
            await runCommand(`git fetch ${depository}`);
        })
        await common.runTask("pull...", async () => {
            await runCommand(`git pull ${depository} ${branch}`);
        })
    } catch (error) {
        logs.logError(error);
    }
    


    // const p = path.join(__dirname, '../../shell/pull.sh');
    // var params = "";
    // if (branch) params = `"${branch}" `;
    // if (depository) params = `${params}"${depository}"`;
    // await common.runTask("pull...", async () => {
    //     try {
    //         // await commandExec(`${bash}${p} ${params}`);
    //         await runSpawnCommand(`${bash}${p} ${params}`);
    //         logs.logInfo('~End~');
    //     } catch (error) {
    //         logs.logError(error);
    //         process.exit(1);
    //     }
    // })


}

const gtagAction = async (tagName, depository) => {
    const p = path.join(__dirname, '../../shell/tag.sh');
    let command = `${bash}${p}`
    if (tagName) {
        command = `${command} "${tagName}"`;
        if (depository) command = `${command} ${depository}`
    } else if (depository) {
        command = `${command} "" ${depository}`
    }
    await common.runTask("tag push...", async () => {
        try {
            await runSpawnCommand(command);
            logs.logInfo('~End~');
        } catch (error) {
            logs.logError(error);
            process.exit(1);
        }
    })
}
module.exports = {
    gpushAction,
    gpullAction,
    gtagAction
}