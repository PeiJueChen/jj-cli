const program = require('commander');
const {
    gpushAction,
    gpullAction,
    gtagAction
} = require('./actionGit');
const create = (process, currentWorkingDir, cliBinDir) => {
    // program
    //     .command('gpush <branch> [others...]')
    //     .description('push your to branch , if not branch , default is current ')
    //     .action(gpushAction);
    const options = program.opts() || {};

    program
        .command('gpush <message> [branch] [-d|--depository]')
        .description('message is required. branch: if not branch, default is current. If not set depository, will by using "git remove -v" the first one found ')
        .action((message, branch) => {
            gpushAction(message || options.message,
                branch || options.branch,
                options.depository
            )
        });

    program
        .command('push <message> [branch] [-d|--depository]')
        .description('message is required. branch: if not branch, default is current. If not set depository, will by using "git remove -v" the first one found ')
        .action((message, branch) => {
            gpushAction(message || options.message,
                branch || options.branch,
                options.depository
            )
        });

    program
        .command('gpull [-b|--branch] [-d|--depository]')
        .description('pull your code before please keep the code clean')
        .action(() => {
            gpullAction(options.branch || null,
                options.depository || null
            );
        });
    program
        .command('pull [-b|--branch] [-d|--depository]')
        .description('pull your code before please keep the code clean')
        .action(() => {
            gpullAction(options.branch || null,
                options.depository || null
            );
        });

    program
        .command('gtag [tagName] [-d|--depository]')
        .description('push your tag, If not set "tagName", will: "${currentBranch}-timestamp"; If not set depository, will by using "git remove -v" the first one found ')
        .action(tagName => {
            gtagAction(tagName, options.depository);
        });

    program
        .command('tag [tagName] [-d|--depository]')
        .description('push your tag, If not set "tagName", will: "${currentBranch}-timestamp"; If not set depository, will by using "git remove -v" the first one found ')
        .action(tagName => {
            gtagAction(tagName, options.depository);
        });



}

module.exports = create