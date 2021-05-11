const program = require('commander');
const { createAction } = require('./action');
const create = (process, currentWorkingDir, cliBinDir) => {
    const options = program.opts() || {};

    program
        .command('create [env] [-e|--env] [-fp|--folderpath]')
        .description('Create your template of : node')
        .action(env => {
            createAction(env || options.env, process, (options.folderpath || currentWorkingDir), cliBinDir)
        })
}

module.exports = create