const program = require('commander');


const option = () => {
    // program.option('-p --platform <platform>', 'What platform do you want to upload ?');
    program.option('-n --notes <notes>', 'Appcenter release notes');
    program.option('-path --apppath <apppath>', 'Set your app path, make sure find the ipa/apk file ');
    program.option('-closedfolder --closedfolder <closedfolder>', 'Whether to close the link & open the folder after the upload is completed');
}

module.exports = option