const fs = require('fs');
const path = require('path');
const util = require("util");

const writeFileAsync = util.promisify(fs.writeFile);
const readFileAsync = util.promisify(fs.readFile);
// 定义数据文件路径
const dataFilePath = path.join(__dirname, '.data.json');

// 保存 JSON 对象
const saveDataToJson = async (data) => {
    if (!data || typeof data !== 'object') {
        console.error('wrong data');
        return;
    }
    const jsonString = JSON.stringify(data, null, 2); // prettier 

    return writeFileAsync(dataFilePath, jsonString);
}

// 读取 JSON 对象
const readDataFromJson = async () => {
    return new Promise((resolve, reject) => {
        fs.readFile(dataFilePath, 'utf8', (err, data) => {
            if (err) {
                resolve(null);
                // if (err.code === 'ENOENT') {
                //     console.error('文件不存在');
                //     callback(null); // 文件不存在时返回 null
                // } else {
                //     console.error('读取 JSON 文件失败:', err);
                //     callback(null);
                // }
                return;
            }

            try {
                const jsonData = JSON.parse(data);
                resolve(jsonData);
            } catch (parseError) {
                // console.error('解析 JSON 文件失败:', parseError);
                resolve(null);
            }
        });
    });

}

module.exports = {
    saveDataToJson,
    readDataFromJson
}