const program = require('commander');

const option = () => {
    program.option('-host --host <host>', '[string] specify hostname');
    program.option('-port --port <port>', '[number] specify port');
    program.option('-staticFolderName --staticFolderName <staticFolderName>', 'Set your staticFolderName, default is "dist"');
}

module.exports = option