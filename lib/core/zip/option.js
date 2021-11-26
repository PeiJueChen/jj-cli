const program = require('commander');


const option = () => {
    program.option('-output --output <output>', 'The name of the output file , default is:  build-xxxx-xx-xx-xxxxxx.zip');
}

module.exports = option