const program = require('commander');
const {
    gpushAction
} = require('./action');
const createCommands = () => {
    // program
    //     .command('gpush <branch> [others...]')
    //     .description('push your to branch , if not branch , default is current ')
    //     .action(gpushAction);
    program
        .command('gpush <message> [branch]')
        .description('push your to branch , if not branch , default is current , message is required')
        .action(gpushAction);
        



}

module.exports = {
    createCommands
}