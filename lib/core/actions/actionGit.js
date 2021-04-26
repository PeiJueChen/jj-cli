
const { commandSpawn, commandExec } = require('../../untils/terminal');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const bash = process.platform === 'win32' ? '' : 'bash ';
const path = require('path');
// https://www.npmjs.com/package/ora
// const ora = require('ora');
// https://www.npmjs.com/package/chalk
// const chalk = require('chalk');
const gpushAction = async (message, branch, depository) => {

    // console.log("message:", message, branch, depository);
    // console.log("JJ ~ file: action.js ~ line 3 ~ gpushAction ~ message", p);
    // commandSpawn(bash, [p], { shell: true, argv0: `${message} ` })
    
    const p = path.join(__dirname, '../../shell/push.sh');
    var params = `"${message}" `;
    if (branch) params = `${params}"${branch}"`;
    if (depository) params = params + ` "${depository}"`;
    await commandExec(`${bash}${p} ${params}`);
}

const gpullAction = async (branch, depository) => {
    const p = path.join(__dirname, '../../shell/pull.sh');
    var params = "";
    if (branch) params = `"${branch}" `;
    if (depository) params = `${params}"${depository}"`;
    await commandExec(`${bash}${p} ${params}`);
}

module.exports = {
    gpushAction,
    gpullAction
}