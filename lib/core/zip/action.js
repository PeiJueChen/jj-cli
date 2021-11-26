const logs = require('../../untils/logs');
const fs = require('../../untils/fs');
const common = require('../../untils/common');
const path = require('path');
const AdmZip = require("adm-zip");
const zip = async (outputName, currentWorkingDir, cliBinDir, ...args) => {
    const file = new AdmZip();
    let vaild = false;
    for (let i = 0; i < args.length; i++) {
        let arg = args[i];
        if (i > 0) {
            let path_ = path.join(currentWorkingDir, arg);
            const isExist = fs.existsSync(path_);
            if (!isExist) {
                logs.logWarn(`${arg} is not exist`);
                continue;
            }
            const target = await fs.lstatAsync(path_);
            if (target.isFile()) {
                vaild = true;
                file.addLocalFile(path_);
            } else if (target.isDirectory()) {
                vaild = true;
                file.addLocalFolder(path_, arg);
            }
        }
    }

    if (!vaild) {
        logs.logFriendly('Could not find any valid files ');
        return
    }

    try {
        await common.runTask(`zip...`, async () => {
            await file.writeZipPromise(outputName);
        })
    } catch (error) {
        throw error;
    }

}


module.exports = {
    zip
}