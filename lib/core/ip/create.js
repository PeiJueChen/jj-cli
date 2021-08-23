const logs = require('../../untils/logs');
const program = require('commander');
const create = (process, currentWorkingDir, cliBinDir) => {
    const options = program.opts() || {};
    program.command('ip')
        .description('Get the IP address of your pc/mac')
        .action(() => {
            logs.logIpAddress()
        })
}

module.exports = create