const chalk = require('chalk');

function log(...args) {
    console.log(...args);
}
exports.log = log;

function logSuccess(...args) {
    console.log(chalk.green('[success]'), ...args);
}
exports.logSuccess = logSuccess;

function logInfo(...args) {
    console.log(chalk.bold.cyan('[info]'), ...args);
}
exports.logInfo = logInfo;

function logWarn(...args) {
    console.log(chalk.bold.yellow('[warn]'), ...args);
}
exports.logWarn = logWarn;
function logError(...args) {
    console.error(chalk.red('[error]'), ...args);
}
exports.logError = logError;
function logFatal(...args) {
    logError(...args);
    return process.exit(1);
}
exports.logFatal = logFatal;

function logFriendly(...args) {
    console.log(chalk.yellow('[Friendly]'), ...args);
}
exports.logFriendly = logFriendly;
