const program = require('commander');


const optionOpen = () => {
    program.option('-p --platform <platform>', 'What platform do you want to open ?');
    program.option('-studio --androidStudioPath <androidStudioPath>', 'Set your linuxAndroidStudioPath')
}

module.exports = {
    optionOpen
}