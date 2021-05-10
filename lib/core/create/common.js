const { promisify } = require('util');
const download = promisify(require('download-git-repo'));
const { nodeRepo } = require('./config/repo-config');
const common = require('../../untils/common');
const logs = require('../../untils/logs');
const { commandSpawn, runSpawnCommand } = require('../../untils/terminal');
const create = async (env, process, currentWorkingDir, cliBinDir) => {

    const map = new Map([
        ['node', parseNode],
        ['vue', () => { }],
        ['react', () => { }]
    ])

    const action = map.get(env);
    action && await action(process, currentWorkingDir, cliBinDir);

}

async function parseNode(process, currentWorkingDir, cliBinDir) {

    await common.runTask('Downloading...', async () => {
        await download(nodeRepo, currentWorkingDir, { clone: true });
    })

    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    await common.runTask('Installing...', async () => {
        await commandSpawn(npm, ['install'], { cwd: `${currentWorkingDir}` });
    })

    const isInstall = await common.isInstalled('nodemon');
    const start = isInstall ? 'nodemon' : 'start';
    logs.logInfo('Serving...');
    commandSpawn(npm, ['run', start], { cwd: `${currentWorkingDir}` });

    const open = await Promise.resolve().then(() => require('open'));
    setTimeout(() => {
        const openLink = `http://localhost:3000/`
        open(openLink, { wait: false });
        logs.logSuccess('done');
    }, 2000);

}

module.exports = {
    create
}