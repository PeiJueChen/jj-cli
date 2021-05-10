const program = require('commander');

const optionCreate = () => {
    program.option('-e --env <env>', 'template: node/react/vue');
}

module.exports = {
    optionCreate
}