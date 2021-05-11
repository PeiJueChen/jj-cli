const program = require('commander');

const option = () => {
    program.option('-e --env <env>', 'template: node/react/vue');
    program.option('-fp --folderpath <folderpath>', 'Set your folder path.');
}

module.exports = option