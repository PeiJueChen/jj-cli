const program = require('commander');


const optionUpload = () => {
    // program.option('-p --platform <platform>', 'What platform do you want to upload ?');
    program.option('-n --notes <notes>', 'Appcenter release notes');
    program.option('-path --apppath <apppath>', 'Set your app path, make sure find the ipa/apk file ');
}

module.exports = {
    optionUpload
}