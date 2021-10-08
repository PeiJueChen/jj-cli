const program = require('commander');

const option = () => {
    program.option('-e --env <env>', 'template: node/react/vue/python');
    program.option('-pn --projectname <projectname>', 'projectname: Specify the name of your scrapy project or your signature project name ');
    program.option('-fp --folderpath <folderpath>', 'Set your folder path.');
}

module.exports = option