
const { runSpawnCommand, commandExec } = require('../../untils/terminal');
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
        await runSpawnCommand(`${bash}${p} ${params}`);
        logs.logInfo('~End~');
    })

}

const gpullAction = async (branch, depository) => {
    const p = path.join(__dirname, '../../shell/pull.sh');
    var params = "";
    if (branch) params = `"${branch}" `;
    if (depository) params = `${params}"${depository}"`;
    await common.runTask("pull...", async () => {
        // await commandExec(`${bash}${p} ${params}`);
        await runSpawnCommand(`${bash}${p} ${params}`);
        logs.logInfo('~End~');
    })
}

const gtagAction = async (tagName, depository) => {
    const p = path.join(__dirname, '../../shell/tag.sh');
    let command = `${bash}${p}`
    if (tagName) {
        command = `${command} "${tagName}"`;
        if (depository) command = `${command} ${depository}`
    }else if (depository) {
        command = `${command} "" ${depository}`
    }
    await common.runTask("tag push...", async () => {
        await runSpawnCommand(command);
        logs.logInfo('~End~');
    })
}
module.exports = {
    gpushAction,
    gpullAction,
    gtagAction
}