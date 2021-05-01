
const timers_1 = require("timers");


async function isInstalled(command) {
    const which = await Promise.resolve().then(() => require('which'));
    return new Promise((resolve) => {
        which(command, (err) => {
            if (err) {
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}
exports.isInstalled = isInstalled;

function wait(time) {
    return new Promise((resolve) => timers_1.setTimeout(resolve, time));
}
exports.wait = wait;

const TIME_UNITS = ['s', 'ms', 'μp'];
function formatHrTime(hrtime) {
    let time = (hrtime[0] + (hrtime[1] / 1e9));
    let index = 0;
    for (; index < TIME_UNITS.length - 1; index++, time *= 1000) {
        if (time >= 1) {
            break;
        }
    }
    return time.toFixed(2) + TIME_UNITS[index];
}
exports.formatHrTime = formatHrTime;

async function runTask(title, fn) {
    const ora = require('ora');
    const spinner = ora(title).start();
    try {
        const start = process.hrtime();
        let taskInfoMessage;
        const value = await fn((message) => taskInfoMessage = message);
        const elapsed = process.hrtime(start);
        const chalk = require('chalk');
        if (taskInfoMessage) {
            spinner.info(`${title} ${chalk.dim('– ' + taskInfoMessage)}`);
        }
        else {
            spinner.succeed(`${title} ${chalk.dim('in ' + formatHrTime(elapsed))}`);
        }
        return value;
    }
    catch (e) {
        spinner.fail(`${title}: ${e.message ? e.message : ''}`);
        spinner.stop();
        throw e;
    }
}
exports.runTask = runTask;

async function getName(name) {
    if (!name) {
        const inquirer = await Promise.resolve().then(() => require('inquirer'));
        const answers = await inquirer.prompt([{
            type: 'input',
            name: 'name',
            default: 'App',
            message: `App name`
        }]);
        return answers.name;
    }
    return name;
}
exports.getName = getName;

async function askPlatform() {
    const inquirer = await Promise.resolve().then(() => require('inquirer'));
    const answer = await inquirer.prompt({
        type: 'list',
        name: 'mode',
        message: 'Please choose a platform to open:',
        choices: ['ios', 'android']
    });
    return answer.mode.toLowerCase().trim();
}
exports.askPlatform = askPlatform;

// https://github.com/mokkabonna/inquirer-autocomplete-prompt
async function askSelectList(source, title) {
    if (!source || source.length === 0) {
        throw new Error('source is empty');
    }
    const inquirer = await Promise.resolve().then(() => require('inquirer'));
    const inquirerPrompt = await Promise.resolve().then(() => require('inquirer-autocomplete-prompt'));

    inquirer.registerPrompt('autocomplete', inquirerPrompt);
    let result = await inquirer.prompt([{
        type: 'autocomplete',
        name: title,
        // 允许上下箭头选择
        suggestOnly: false,
        message: `Please Enter / Choose Your ${title}: `,
        searchText: 'Searching...',
        emptyText: 'Nothing found!',
        // pageSize: 2,
        source: async (answers, input) => {
            input = input || '';
            return new Promise(function (resolve) {
                resolve(
                    source.filter(s => {
                        let s_ = (s && s.toLowerCase()) || "";
                        let i_ = (input && input.toLowerCase()) || "";
                        return ~(s_).indexOf(i_);
                    })
                );
            });
        },
    }])
    const r = result && result[title] || "";
    return ~source.indexOf(r) ? r : null;
}

exports.askSelectList = askSelectList;