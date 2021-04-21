
const { commandSpawn, execCommand } = require('../untils/terminal');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const bash = process.platform === 'win32' ? '' : 'bash ';
const path = require('path');
const gpushAction = (message, branch) => {
    const p = path.join(__dirname, '../shell/push.sh');
    // console.log("JJ ~ file: action.js ~ line 3 ~ gpushAction ~ message", message)
    // commandSpawn(bash, [p], { shell: true, argv0: `${message} ` })
    var params = `${message} `;
    if (branch) params += branch
    execCommand(`${bash}${p} ${params}`);
}


module.exports = {
    gpushAction
}