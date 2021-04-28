const program = require('commander');
const chalk_1 = require("chalk");
const helpOpitons = () => {
    program.option('-j --jj', 'A TOOL CLI. Provide Some Quick Ways ');
    // 最後可以根據:  program.message 獲取

    program
        .arguments('<command>')
        .action((cmd) => {
            program.outputHelp();
            console.log(`  ` + chalk_1.red(`\n  Unknown command ${chalk_1.yellow(cmd)} .`));
            console.log();
        });

    program.on('--help', function () {
        // console.log("listen help");
    })

}

module.exports = helpOpitons;

