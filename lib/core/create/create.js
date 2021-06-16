const program = require('commander');
const { createAction } = require('./action');
const { renameAsync, replaceContent } = require('./../../untils/fs')
const create = (process, currentWorkingDir, cliBinDir) => {
    const options = program.opts() || {};

    program
        .command('create [env] [pn] [-e|--env] [-fp|--folderpath] [-pn|--projectname]')
        .description('Create your template of : node')
        .action(async (env, pn) => {

            createAction(env || options.env, process, (options.folderpath || currentWorkingDir), cliBinDir, pn || options.projectname)

        })
}

module.exports = create