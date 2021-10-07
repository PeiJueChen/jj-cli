const program = require('commander');


const option = () => {
    program.option('-p --platform <platform>', 'What platform do you want to open / upload / sign ?');
    program.option('-studio --androidStudioPath <androidStudioPath>', 'Set your androidStudioPath')
}

module.exports = option