const common = require('../../untils/common');
const logs = require('../../untils/logs');
const fs = require("../../untils/fs");
// const envs = {
//     node: 'node'
// }
const envs = require('./../../constants/envs');
const common2 = require('./common');

const createAction = async (env, process, currentWorkingDir, cliBinDir, projectName) => {

    // const isEmptyPath = await fs.directoryIsEmpty(currentWorkingDir);
    // if (!isEmptyPath) {
    //     logs.logFatal(`Please keep the current folder clean.`);
    // }
    var e = envs[env];
    if (!e) {
        let e_ = await common.askChoose('Env', Object.keys(envs))
        e = envs[e_];
        if (!e) {
            logs.logFatal(`Only support ${envs} now.`);
            return;
        }
    }
    if (e === 'python' && !projectName) {
        logs.logFatal(`Missing your project name, you can: -pn xxxx`);
        return
    }

    try {
        await common2.create(e, process, currentWorkingDir, cliBinDir, projectName);
    } catch (error) {
        logs.logFatal(error);
    }

}

module.exports = {
    createAction
}