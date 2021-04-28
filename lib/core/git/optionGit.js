const program = require('commander');


const optionGit = () => {
    program.option('-m --message <message>', 'Commit message');
    program.option('-b --branch <branch>', 'Set your branch; Default is \'current\'');
    program.option('-d --depository <depository>', 'Set your depository, Default is: orgin');
}

module.exports = {
    optionGit
}