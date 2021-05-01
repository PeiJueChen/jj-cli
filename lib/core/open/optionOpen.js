const program = require('commander');


const optionOpen = () => {
    program.option('-p --platform <platform>', 'What platform do you want to open / upload ?');
    program.option('-studio --androidStudioPath <androidStudioPath>', 'Set your androidStudioPath')
}

module.exports = {
    optionOpen
}