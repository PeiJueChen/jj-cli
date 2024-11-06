const program = require('commander');


const option = () => {
    program.option('-e --email <email>', 'cliq, email ');
    program.option('-t --token <token>', 'cliq, token ');
}

module.exports = option