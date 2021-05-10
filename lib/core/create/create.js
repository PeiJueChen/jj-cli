const program = require('commander');
const { createAction } = require('./action');
const createCreate = (process, currentWorkingDir, cliBinDir) => {
    const options = program.opts() || {};

    program
        .command('create [env] [-e|--env]')
        .description('Create your template of : node')
        .action(env => {
            createAction(env || options.env, process, currentWorkingDir, cliBinDir)
        })
}

module.exports = {
    createCreate
}