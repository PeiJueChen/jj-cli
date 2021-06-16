const { promisify } = require('util');
const download = promisify(require('download-git-repo'));
const { nodeRepo, pythonRepo } = require('./config/repo-config');
const common = require('../../untils/common');
const logs = require('../../untils/logs');
const { commandSpawn, runSpawnCommand } = require('../../untils/terminal');
const { renameAsync, mkdirAsync, replaceContent, syncCopyFolder, syncDeleteFolder } = require('./../../untils/fs');
const path = require('path');
const create = async (env, process, currentWorkingDir, cliBinDir, projectName) => {

    const map = new Map([
        ['node', parseNode],
        ['vue', () => { }],
        ['react', () => { }],
        ['python', parsePython]
    ])

    const action = map.get(env);
    action && await action(process, currentWorkingDir, cliBinDir, projectName);

}

async function parsePython(process, currentWorkingDir, cliBinDir, projectName) {

    if (~projectName.indexOf(' ')) {
        logs.logFatal('Your project name contains spaces')
        return;
    }

    const proPath = path.resolve(currentWorkingDir, projectName)
    await mkdirAsync(proPath)

    await common.runTask('Downloading...', async () => {
        await download(pythonRepo, proPath, { clone: true });
    })

    // 更改文件名稱
    logs.logFriendly('handle file...')
    await renameAsync(path.resolve(proPath, 'pythonScrapyTemplate'), path.resolve(proPath, projectName))
    await renameAsync(path.resolve(proPath, projectName, 'spiders', 'template.py'), path.resolve(proPath, projectName, 'spiders', `${projectName}Spider.py`))

    // change file content
    ProjectName = projectName.slice(0, 1).toUpperCase() + projectName.slice(1);
    await replaceContent(path.resolve(proPath, projectName, 'spiders', `${projectName}Spider.py`), 'TemplateSpider', `${ProjectName}Spider`)
    await replaceContent(path.resolve(proPath, projectName, 'spiders', `${projectName}Spider.py`), 'template', projectName)

    // await replaceContent(path.resolve(proPath, projectName, 'tool', `download.py`), 'pythonScrapyTemplate', projectName)

    await replaceContent(path.resolve(proPath, 'run.sh'), 'pythonScrapyTemplate', projectName)
    await replaceContent(path.resolve(proPath, 'scrapy.cfg'), 'pythonScrapyTemplate', projectName)
    await replaceContent(path.resolve(proPath, projectName, 'main.py'), 'template', projectName)
    await replaceContent(path.resolve(proPath, projectName, 'settings.py'), 'pythonScrapyTemplate', projectName)


    await renameAsync(currentWorkingDir, currentWorkingDir + '_jjtemp');
    const tempPath = currentWorkingDir + '_jjtemp';
    const lastPath = path.resolve(tempPath, '../')
    syncCopyFolder(tempPath, lastPath)
    syncDeleteFolder(tempPath)
    logs.logSuccess('Done~')
    const nowProjectPath = path.resolve(lastPath, projectName);
    const open = await Promise.resolve().then(() => require('open'));
    open(nowProjectPath, { wait: false });

}

async function parseNode(process, currentWorkingDir, cliBinDir, projectName) {

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