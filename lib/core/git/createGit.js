const program = require('commander');
const {
    gpushAction,
    gpullAction
} = require('./actionGit');
const createGit = (process, currentWorkingDir, cliBinDir) => {
    // program
    //     .command('gpush <branch> [others...]')
    //     .description('push your to branch , if not branch , default is current ')
    //     .action(gpushAction);
    const options = program.opts() || {};

    program
        .command('gpush <message> [branch] [-d|--depository]')
        .description('message is required. branch: if not branch, default is current.  depository: if not set, default is current')
        .action((message, branch) => {
            // console.log("JJ ~ file: create.js ~ line 14 ~ .action ~ message:", message, branch, options, ':end:');
            gpushAction(message || options.message,
                branch || options.branch,
                options.depository
            )
        });

    program
        .command('gpull [-b|--branch] [-d|--depository]')
        .description('pull your code before please keep the code clean ')
        .action(() => {
            // console.log("JJ ~ file: create.js ~ line 27 ~ .action ~ b", options.branch, options.depository, 'end');
            gpullAction(options.branch || null,
                options.depository || null
            );
        });




}

module.exports = {
    createGit
}