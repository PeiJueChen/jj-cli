const program = require('commander');


const option = () => {
    program.option('-appcenter --appcenter <appcenter>', 'To upload to appcenter, specify uat/prd (configured in sign.config)');
}

module.exports = option