"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const fsExtra = require("fs-extra");
const fs = require("fs");
const util = require("util");
const path1 = require('path');
const format = require('./format');
const path = require('path');

exports.existsSync = (path) => {
    return fs.existsSync(path);
};
const mkdir = util.promisify(fs.mkdir);
exports.mkdirAsync = mkdir
exports.mkdirAsyncRecursive = async (path) => {
    await mkdir(path, { recursive: true })
}
exports.symlinkAsync = util.promisify(fs.symlink);
const read = util.promisify(fs.readFile);
exports.readFileAsync = read
exports.readFileContentAsync = async (path) => {
    return await read(path, { encoding: 'utf8' });
}
exports.writeFileAsync = util.promisify(fs.writeFile);
exports.readdirAsync = util.promisify(fs.readdir);
// exports.readdirsync = util.promisify(fs.readFileSync);
exports.statAsync = util.promisify(fs.stat);
exports.lstatAsync = util.promisify(fs.lstat);
exports.renameAsync = util.promisify(fs.rename);
exports.unlinkSync = util.promisify(fs.unlinkSync);
// exports.copyAsync = fsExtra.copy;
// exports.removeAsync = fsExtra.remove;
// exports.removeSync = fsExtra.removeSync;
// exports.ensureDirSync = fsExtra.ensureDirSync;
// exports.copySync = fsExtra.copySync;
// exports.readFileSync = fsExtra.readFileSync;
// exports.writeFileSync = fsExtra.writeFileSync;


exports.replaceContent = async (path, oldContent, newContent) => {
    if (!path) return
    const readFileAsync = util.promisify(fs.readFile);
    const content = await readFileAsync(path, { encoding: 'utf8' });
    const ref = new RegExp(oldContent, 'g')
    const newc = content.replace(ref, newContent);
    const writeFileAsync = util.promisify(fs.writeFile);
    await writeFileAsync(path, newc, { encoding: 'utf8' })
}


exports.existsAsync = async (path) => {
    try {
        const stat = await exports.statAsync(path);
        return true;
    }
    catch (_a) {
        return false;
    }
};
exports.convertToUnixPath = (path) => {
    return path.replace(/\\/g, '/');
};

async function directoryIsEmpty(path) {
    if (!path) return false;
    const target = await exports.lstatAsync(path);
    if (target.isFile()) {
        console.log("is file");
        return false;
    }
    if (target.isDirectory()) {
        const dirList = await exports.readdirAsync(path);
        if (dirList.length === 1 && dirList[0] === '.DS_Store') {
            return true
        }
        return dirList.length === 0;
    }
    return false;
}
exports.directoryIsEmpty = directoryIsEmpty;

/**
 * @param { delPath：String } （需要删除文件的地址）
 * @param { direct：Boolean } （是否需要处理地址）
 */
function deleteFile(delPath, direct = true) {
    delPath = direct ? delPath : path.join(__dirname, delPath)
    try {
        /**
         * @des 判断文件或文件夹是否存在
         */
        if (fs.existsSync(delPath)) {
            fs.unlinkSync(delPath);
        } else {
            console.log('inexistence path：', delPath);
        }
    } catch (error) {
        console.log('del error', error);
    }
}

exports.deleteFile = deleteFile

function syncDeleteFolder(delPath, direct = true) {
    if (!direct) {
        delPath = path.join(__dirname, delPath)
    }
    try {
        if (fs.existsSync(delPath)) {
            const delFn = function (address) {
                const files = fs.readdirSync(address)
                for (let i = 0; i < files.length; i++) {
                    const dirPath = path.join(address, files[i])
                    if (fs.statSync(dirPath).isDirectory()) {
                        delFn(dirPath)
                    } else {
                        deleteFile(dirPath, true)
                    }
                }
                /**
                * @des 只能删空文件夹
                */
                fs.rmdirSync(address);
            }
            delFn(delPath);
        } else {
            console.log('do not exist: ', delPath);
        }
    } catch (error) {
        console.log('del folder error', error);
    }
}
exports.syncDeleteFolder = syncDeleteFolder;

/**
 * @param { sourcePath：String } （需要删除文件夾的地址）
 * @param { targetPath：String } （目標路徑）
 * @param { direct：Boolean } （是否需要处理地址）
 */
function syncCopyFolder(sourcePath, targetPath, direct = true) {
    if (!direct) {
        sourcePath = path.join(__dirname, sourcePath)
        targetPath = path.join(__dirname, targetPath)
    }

    function createDir(dirPath) {
        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath)
    }

    if (fs.existsSync(sourcePath)) {
        createDir(targetPath)
        /**
         * @des 方式一：利用子进程操作命令行方式
         */
        // child_process.spawn('cp', ['-r', sourcePath, targetPath])

        /**
         * @des 方式二：
         */
        const files = fs.readdirSync(sourcePath, { withFileTypes: true });
        for (let i = 0; i < files.length; i++) {
            const cf = files[i]
            const ccp = path.join(sourcePath, cf.name)
            const crp = path.join(targetPath, cf.name)
            if (cf.isFile()) {
                /**
                 * @des 创建文件,使用流的形式可以读写大文件
                 */
                const readStream = fs.createReadStream(ccp)
                const writeStream = fs.createWriteStream(crp)
                readStream.pipe(writeStream)
            } else {
                try {
                    /**
                     * @des 判断读(R_OK | W_OK)写权限
                     */
                    fs.accessSync(path.join(crp, '..'), fs.constants.W_OK)
                    syncCopyFolder(ccp, crp, true)
                } catch (error) {
                    console.log('folder write error:', error);
                }

            }
        }
    } else {
        console.log('do not exist path: ', sourcePath);
    }
}

exports.syncCopyFolder = syncCopyFolder;

const getSize = (size) => {
    if (!size) return '0M'
    const s = size / 1000000;
    return `${s.toFixed(2)}M`
}


exports.getSizeByPath = async (path) => {
    if (!path || !fs.existsSync(path)) return '';
    const target = await exports.lstatAsync(path);
    if (!target.isFile()) return '';
    return getSize(target.size);
};

async function findFiles(path, extname, ignoreNodeModuleDir = false, searchAll = false) {
    if (!path || (!extname && !searchAll)) {
        throw new Error("Missing Path Or Extname");
    }
    const files = [];
    const sourcePath = path;
    const action = async (path, extname) => {
        var dirList = await exports.readdirAsync(path);
        for (var i = 0; i < dirList.length; i++) {
            const itemName = dirList[i];
            const p = path1.join(path, itemName);
            const target = await exports.lstatAsync(p);
            if (target.isDirectory()) {
                if (itemName === 'node_modules' && ignoreNodeModuleDir) {
                    continue;
                } else {
                    await action(p, extname)
                }
            } else if (target.isFile()) {
                const add = () => {
                    const createTime = format.formatDate(parseInt(target.atimeMs), 'yyyy-MM-dd hh:mm:ss')
                    const file = { name: itemName, time: createTime, fullPath: p, shortPath: p.replace(sourcePath, ""), size: getSize(target.size) }
                    files.push(file);
                }
                if (extname instanceof Array) {
                    const find = extname.find(e => e == path1.extname(p));
                    if (find) {
                        add();
                    }
                } else if (extname === path1.extname(p) || searchAll) {
                    add();
                }


            }
        }
    }
    await action(path, extname);
    return files;
}

exports.findFiles = findFiles;