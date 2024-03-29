const https = require('https');


// https://aigensstoretest.aigens.com/api/v1/store/config.json?type=app&storeId=5704131641606144
const getDeviceConfig = async () => {
    return new Promise((resolve, reject) => {
        const url = 'https://aigensstoretest.aigens.com/api/v1/store/config.json?type=app&storeId=5704131641606144';
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });

}


module.exports = {
    getDeviceConfig
}
