const fs = require('fs');
const path = require('path');


const loadCommand = (process, currentWorkingDir, cliBinDir) => {
    const loopAction = (currentPath) => {
        fs.readdirSync(currentPath, { withFileTypes: true }).forEach(file => {
            const name = file.name;
            if (file.isFile()) {
                if (~name.indexOf('help') || ~name.indexOf('option') || ~name.indexOf('create')) {
                    const action = require(`${currentPath}/${name}`);
                    action(process, currentWorkingDir, cliBinDir)
                }
            } else if (file.isDirectory()) {
                loopAction(path.resolve(currentPath, name));
            }
        })
    }

    loopAction(__dirname);

}

module.exports = loadCommand;
