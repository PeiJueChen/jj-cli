const path = require('path');
const logs = require('../../untils/logs');
const { existsSync, directoryIsEmpty } = require('../../untils/fs');
const { runPreview } = require('./common');



const preview = async (process, currentWorkingDir, host, port, folderName) => {
    let staticPath = path.resolve(currentWorkingDir, folderName);

    if (!existsSync(staticPath)) {

        let indexPath = path.resolve(currentWorkingDir, 'index.html');
        if (existsSync(indexPath)) {
            staticPath = path.resolve(currentWorkingDir, './');
        } else {
            logs.logFatal(`Cann't found ${folderName} folder or index.html`);
        }
    }
    const isEmpty = await directoryIsEmpty(staticPath);
    if (isEmpty) {
        logs.logFatal(`${folderName} folder is empty`);
    }

    runPreview(host, port, staticPath);

}




module.exports = {
    preview
}