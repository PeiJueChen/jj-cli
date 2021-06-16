"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const fsExtra = require("fs-extra");
const fs = require("fs");
const util = require("util");
const path1 = require('path');
const format = require('./format');
exports.existsSync = (path) => {
    return fs.existsSync(path);
};
exports.mkdirAsync = util.promisify(fs.mkdir);
exports.symlinkAsync = util.promisify(fs.symlink);
exports.readFileAsync = util.promisify(fs.readFile);
exports.writeFileAsync = util.promisify(fs.writeFile);
exports.readdirAsync = util.promisify(fs.readdir);
// exports.readdirsync = util.promisify(fs.readFileSync);
exports.statAsync = util.promisify(fs.stat);
exports.lstatAsync = util.promisify(fs.lstat);
exports.renameAsync = util.promisify(fs.rename);
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

async function findFiles(path, extname, ignoreNodeModuleDir = false) {
    if (!path || !extname) {
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
                if (extname === path1.extname(p)) {
                    const createTime = format.formatDate(parseInt(target.birthtimeMs), 'yyyy-MM-dd hh:mm:ss')
                    const file = { name: itemName, time: createTime, fullPath: p, shortPath: p.replace(sourcePath, "") }
                    files.push(file);
                }

            }
        }
    }
    await action(path, extname);
    return files;
}

exports.findFiles = findFiles;