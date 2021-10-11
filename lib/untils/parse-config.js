const path = require('path');
const fs = require('./fs');
const logs = require('./logs');
const common = require('./common');
const configName = "jj.config.json"
const windowDefaultConfig = "C:\\Users\\aigens-pc\\Desktop\\Android-sign\\jj.config.json";
const macDefaultConfig = "/Users/chenpeijue/Desktop/Android-sign/jj.config.json";

exports.parseConfig = async (configPathDiretory) => {
    let configPath = path.resolve(configPathDiretory, configName);
    const isExist = fs.existsSync(configPath)
    if (!isExist) {
        // to default holder to find 
        configPath = process.platform === 'win32' ? windowDefaultConfig : process.platform === 'darwin' ? macDefaultConfig : '';
        if (!configPath || !fs.existsSync(configPath)) logs.logFatal('Cannot find sign config file');

        configPathDiretory = path.join(configPath, '../');
    }
    var config = await fs.readFileContentAsync(configPath);
    if (!config) logs.logFatal(`${configName} is empty.`);
    if (typeof config === 'string') config = JSON.parse(config);


    return { config, configPathDiretory };
};

exports.parseConfigPromise = (configPathDiretory) => {
    return new Promise(async (resolve, reject) => {
        let configPath = path.resolve(configPathDiretory, configName);
        const isExist = fs.existsSync(configPath)
        if (!isExist) {
            // to default holder to find 
            configPath = process.platform === 'win32' ? windowDefaultConfig : process.platform === 'darwin' ? macDefaultConfig : '';
            if (!configPath || !fs.existsSync(configPath)) {
                // logs.logFatal('Cannot find sign config file');
                reject('Cannot find sign config file');
            }

            configPathDiretory = path.join(configPath, '../');
        }
        var config = await fs.readFileContentAsync(configPath);
        if (!config) logs.logFatal(`${configName} is empty.`);
        if (typeof config === 'string') config = JSON.parse(config);

        resolve({ config, configPathDiretory })
    })

};

exports.askProjects = (config, projectName) => {

    return new Promise(async (resolve, reject) => {
        const allProjects = config.projects || [];

        if (projectName) {
            const projectTemp = allProjects.find(p => ~p.name.indexOf(projectName))
            if (projectTemp) {
                resolve(projectTemp);
                return;
            }
        }

        const projects = allProjects.map(p => p && p.name || "")
        const ps = projects.some(p => !p)
        if (ps) {
            // logs.logFatal('Please write all `project` field as project name');
            reject('Please write all `project` field as project name');
        }
        const project = await common.askSelectList(projects, 'Project');
        resolve(allProjects.find(p => p.name === project));
    })

}