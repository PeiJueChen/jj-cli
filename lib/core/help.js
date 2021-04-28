const program = require('commander');

const helpOpitons = () => {
    program.option('-j --jj', 'A TOOL CLI. Provide Some Quick Ways ');
    // 最後可以根據:  program.message 獲取
    
    program.on('--help', function() {
        // console.log("listen help");
    })
}

module.exports = helpOpitons;

