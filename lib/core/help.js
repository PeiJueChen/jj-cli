const program = require('commander');

const helpOpitons = () => {
    program.option('-j --j', 'a jj cli');
    program.option('-m --message <message>', 'commit message');
    program.on('--help', function() {
        // console.log("listen help");
    })
}

module.exports = helpOpitons;