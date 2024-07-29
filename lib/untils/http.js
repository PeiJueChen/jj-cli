const https = require('https');


// https://aigensstoretest.aigens.com/api/v1/store/config.json?type=app&storeId=5704131641606144
const getDeviceConfig = async (storeId) => {

    const t = () => {
        https://aigensstoretest.aigens.com/api/v1/store/config.json
        var h = "https://";
        h += "aigensstoretest_.";
        h += "aigens.com";
        h += "/api/v1/store/config.json";
        var u = h;
        u += "?type=app";
        u += `&storeId=${storeId}`;
        return encodeURIComponent(u);
    }

    return new Promise((resolve, reject) => {
        https.get(decodeURIComponent(t()).replace(/_/g,"")+"4", (res) => {
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
