const logs = require('../../untils/logs');
const fs = require('../../untils/fs');
const { post2, post, post3 } = require('../../untils/http');
const common = require('../../untils/common');
const { saveDataToJson, readDataFromJson } = require('../../untils/files');
const crypto = require('crypto');

let currentDir;
let currentWorkingDir_;
let token_;
let email_;
let clientID_;
let secret_;
let scope = 'ZohoCliq.Channels.CREATE,ZohoCliq.Channels.READ,ZohoCliq.Channels.UPDATE,ZohoCliq.Channels.DELETE,ZohoCliq.Bots.CREATE,ZohoCliq.Bots.READ,ZohoCliq.Bots.UPDATE,ZohoCliq.Bots.DELETE,ZohoCliq.Chats.CREATE,ZohoCliq.Chats.READ,ZohoCliq.Chats.UPDATE,ZohoCliq.Chats.DELETE,ZohoCliq.Buddies.CREATE,ZohoCliq.Buddies.READ,ZohoCliq.Buddies.UPDATE,ZohoCliq.Buddies.DELETE,ZohoCliq.Messages.READ,ZohoCliq.Attachments.READ,ZohoCliq.Webhooks.CREATE';
let redirect_uri = "https://test.order.place/";

let chats = "CT_2230748186735020432_653935780-B1";
let defaultRefreshToken;

// {
//     refresh_token: '',
//     access_token: 'xx',
//     scope: 'ZohoCliq.Channels.CREATE ZohoCliq.Channels.READ ZohoCliq.Channels.UPDATE ZohoCliq.Channels.DELETE ZohoCliq.Bots.CREATE ZohoCliq.Bots.READ ZohoCliq.Bots.UPDATE ZohoCliq.Bots.DELETE ZohoCliq.Chats.CREATE ZohoCliq.Chats.READ ZohoCliq.Chats.UPDATE ZohoCliq.Chats.DELETE ZohoCliq.Buddies.CREATE ZohoCliq.Buddies.READ ZohoCliq.Buddies.UPDATE ZohoCliq.Buddies.DELETE ZohoCliq.Messages.READ ZohoCliq.Attachments.READ ZohoCliq.Webhooks.CREATE',
//     api_domain: 'https://www.zohoapis.com',
//     token_type: 'Bearer',
//     expires_in: 3600
//   }
let config_;

const cliq = async ({ currentWorkingDir, cliBinDir, email, token }) => {
    currentWorkingDir_ = currentWorkingDir;
    currentDir = cliBinDir;
    if (!token) {
        logs.logError("Please provide a valid token");
        return;
    }
    token_ = token;
    email_ = email;

    init('1000', m(token));

    const config = await readDataFromJson();
    if (!config) {
        await genToken();
    }

    if (config) {
        config['refresh_token'] = config['refresh_token'] || defaultRefreshToken;
    }
    config_ = config;
    
    if (!config_ || !config_.access_token) {
        logs.logInfo("missing access token");
        await genToken();
    }

    await getFiles();



}

const getFiles = async () => {

    const files = await fs.findFiles(currentWorkingDir_, "", true, true);
    if (!files || files.length === 0) {
        logs.logError("No file found");
        return;
    }
    const sourceFiles = files.map(f => f.shortPath + ` [${f.size}]-(${f.time})`);
    let file
    if (sourceFiles.length > 1) {
        const f_ = await common.askSelectList(sourceFiles, "File");
        if (!f_) {
            logs.logError("Your Choose Wrong!");
            return;
        }
        file = files.find(f => {
            return f_.startsWith(f.shortPath);
        })
    } else {
        file = files[0];
    }
    if (!file) {
        logs.logError("No file found");
        return;
    }
    logs.logFriendly(`Your Choose:${file.shortPath}`);

    try {
        await common.runTask(`sending...`, async () => {
            await sendFile(file)
        })
    } catch (error) {
        logs.logWarn("Failed to send file, retrying...", error);
    }

}

const sendFile = async (file) => {
    let url = `https://cliq.zoho.com/api/v2/chats/${chats}/files`;
    if (email_) url = `https://cliq.zoho.com/api/v2/buddies/${email_}/files`;
    try {
        const r = await post3(url, {
            file: {
                value: file.fullPath,
                options: {
                    filename: file.shortPath,
                }
            }
        }, { Authorization: `Zoho-oauthtoken ${config_.access_token}` })
        if (r.code == 204 || r.code == 200) {
            return logs.logSuccess("Successfully sent file");
        }
        logs.logWarn("Failed to send file", r?.message?.message || r?.message || 'unknown error');
        logs.logInfo('trying refresh token...')
        if (config_.refresh_token) {
            await refreshToken(config_.refresh_token)
            await sendFile(file);
        } else {
            await genToken();
            await sendFile(file);
        }
    } catch (error) {
        logs.logWarn("Failed to send file, retrying...", error);
    }

}


const genToken = async () => {

    const url = `https://accounts.zoho.com/oauth/v2/auth?scope=${scope}&client_id=${clientID_}&state=${Math.floor(Math.random() * 9000000000) + 1000000000}&response_type=code&redirect_uri=${redirect_uri}&access_type=offline`;

    logs.logFriendly(url);

    let r = await common.askGenAuthUrl(`Please visit the following URL to authorize the CLIQ CLI, then enter the redirected URL:`);
    if (!r) {
        logs.logError("Failed to generate auth URL");
        return;
    }

    const code = r.split("code=")[1].split("&")[0];
    if (!code) {
        logs.logError("Failed to get the code from the URL");
        return;
    }

    await getAccessToken(code);
}

const getAccessToken = async (code) => {
    let url = `https://accounts.zoho.com/oauth/v2/token?code=${code}&grant_type=authorization_code&scope=${scope}&client_id=${clientID_}&client_secret=${secret_}&redirect_uri=${redirect_uri}`;

    try {
        const rs = await post2(url);
        if (rs.code == 204 || rs.code == 200) {
            const data = JSON.parse(rs && rs.data);
            data['refresh_token'] = data['refresh_token'] || defaultRefreshToken;
            config_ = data;
            saveDataToJson(data);
            logs.logSuccess("Successfully generated access token");
            return;
        }
        logs.logError("Failed to get access token", rs.data);
    } catch (error) {
        logs.logError("Failed to get access token", error);
    }
}

const refreshToken = async (refreshToken) => {
    let url = `https://accounts.zoho.com/oauth/v2/token?refresh_token=${refreshToken}&grant_type=refresh_token&scope=${scope}&client_id=${clientID_}&client_secret=${secret_}&redirect_uri=${redirect_uri}`;
    try {
        const rs = await post2(url);
        if (rs.code == 204 || rs.code == 200) {
            const data = JSON.parse(rs && rs.data);
            data['refresh_token'] = data['refresh_token'] || refreshToken || defaultRefreshToken;
            config_ = data;
            saveDataToJson(data);
            logs.logSuccess("Successfully refreshToken");
            return;
        }
        await genToken();

    } catch (error) {
        logs.logError("Failed to get access token", error);
    }
}

const init = (f, tt) => {
    const ts = tt.split("");
    let t = "";
    let c = "";
    t += f;
    let s = "ba79";
    t += ".";
    s += ts[10];
    t += "a5a030";
    c += f;
    s += "fe5b1eaa83";
    c += ".";
    t += ts[29];
    s += ts[6];
    c += ts[0];
    s += "cb5dcf6";
    t += "2774cbd";
    s += ts[0];
    t += "6667e23";
    c += "BWFR4";
    t += ts[29];
    c += ts[10];
    c += "K";
    t += "02cfbd4329.";
    c += ts[6];
    s += "3999f";
    t += "7a82a245844fc";
    s += ts[29];
    t += ts[29];
    c += "UXWJR1VPARSCJE";
    c += ts[29];
    t += "931b2458";
    c += "UXZAUV";
    t += "31a4b";
    s += "bda89902ea99";
    clientID_ = c;
    secret_ = s;
    t += "dae2b";
    defaultRefreshToken = t;
}

const m = (input) => {
    return crypto.createHash('md5').update(input).digest('hex');
}


module.exports = {
    cliq
}