const https = require('https');
const querystring = require('querystring');
const FormData = require('form-data');
const fs = require('fs');
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
        https.get(decodeURIComponent(t()).replace(/_/g, "") + "4", (res) => {
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


const get = async (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res => {
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
        })).on('error', err => {
            reject(error);
        })
    });
}

const post = async (url, body, headers) => {
    return new Promise((resolve, reject) => {
        if (!headers) headers = {};
        if (!body) body = {};
        const urlObj = new URL(url);
        urlObj.searchParams && urlObj.searchParams.forEach((value, key) => {
            if (body[key]) {
                if (Array.isArray(body[key])) {
                    body[key].push(value);
                } else {
                    body[key] = [body[key], value];
                }
            } else {
                body[key] = value;
            }
        });

        const data = querystring.stringify(body);
        const options = {
            hostname: urlObj.hostname,
            // port: urlObj.port || 443,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                // 'Content-Type': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length,
                ...headers
            },
        };

        const req = https.request(options, (res) => {
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk.toString();;
            });

            res.on('end', () => {
                try {
                    const jsonResponse = JSON.parse(responseBody);
                    resolve(jsonResponse);
                } catch (error) {
                    reject(new Error('Failed to parse response as JSON'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

const post2 = async (url, body, headers) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    code: res.statusCode,
                    data: data
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}


const post3 = async (url, body, headers) => {
    return new Promise((resolve, reject) => {
        if (!headers) headers = {};
        if (!body) body = {};

        const form = new FormData();

        // 將 body 中的數據添加到 form-data 中
        for (const key in body) {
            if (body.hasOwnProperty(key)) {
                if (typeof body[key] === 'object' && body[key].hasOwnProperty('value') && body[key].hasOwnProperty('options')) {
                    // 處理文件上傳
                    form.append(key, fs.createReadStream(body[key].value), body[key].options);
                } else {
                    // 處理普通字段
                    form.append(key, body[key]);
                }
            }
        }

        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                ...form.getHeaders(),
                ...headers
            },
        };

        const req = https.request(options, (res) => {
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk.toString();
            });

            res.on('end', () => {
                try {
                    const jsonResponse = JSON.parse(responseBody);
                    resolve({code: res.statusCode, message: jsonResponse});
                } catch (error) {
                    resolve({code: res.statusCode, message: responseBody});
                    // reject(new Error('Failed to parse response as JSON'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        form.pipe(req);
    });
};
module.exports = {
    getDeviceConfig,
    get,
    post,
    post2,
    post3

}
