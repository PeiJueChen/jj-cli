const chalk = require('chalk');
const os = require('os');
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
    return process.exit(1);
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

const cyan = (...args) => {
    console.log(chalk.cyan.bold(chalk.cyan(...args)));
}
exports.cyan = cyan;
const green = (...args) => {
    console.log(chalk.cyan.bold(chalk.green(...args)));
}
exports.green = green;
const blue = (...args) => {
    console.log(chalk.cyan.bold(chalk.blue(...args)));
}
exports.blue = blue;
exports.red = (...args) => {
    console.log(chalk.cyan.bold(chalk.red(...args)));
}
exports.grey = (...args) => {
    console.log(chalk.cyan.bold(chalk.grey(...args)));
}

exports.printServerUrls = (
    hostname,
    protocol,
    port
) => {
    if (hostname.host === '127.0.0.1') {
        const url = `${protocol}://${hostname.name}:${chalk.bold(port)}`
        logFriendly(`  > Local: ${chalk.cyan(url)}`)
        if (hostname.name !== '127.0.0.1') {
            logFriendly(`  > Network: ${chalk.dim('use `--host` to expose')}`)
        }
    } else {
        const interfaces = Object.values(os.networkInterfaces());
        const inter = []
        interfaces.forEach(i => inter.push(...i))
        inter.filter((detail) => detail.family === 'IPv4')
            .map((detail) => {
                const type = detail.address.includes('127.0.0.1')
                    ? 'Local:   '
                    : 'Network: '
                const host = detail.address.replace('127.0.0.1', hostname.name)
                const url = `${protocol}://${host}:${chalk.bold(port)}`
                return `  > ${type} ${chalk.cyan(url)}`
            })
            .forEach((msg) => logFriendly(msg))
    }
}

exports.logIpAddress = () => {

    const interfaces = Object.values(os.networkInterfaces());
    const inter = []
    interfaces.forEach(i => inter.push(...i))
    inter.filter((detail) => detail.family === 'IPv4')
        .map((detail) => {
            if (detail.address !== '127.0.0.1') {
                const url = `http://${detail.address}`
                return `\n> Your Ip:  ${chalk.cyan(url)}\n`
            }
        })
        .forEach((msg) => msg && console.log(msg))
}