const program = require('commander');
const { cliq } = require('./action');
const create = (process, currentWorkingDir, cliBinDir) => {
    const options = program.opts() || {};

    program
        .command('cliq [-e|--email] [-t|--token]')
        .description('cliq')
        .action(type => {
            cliq({
                currentWorkingDir,
                cliBinDir,
                email: options.email,
                token: options.token,
            })
        })
}

module.exports = create