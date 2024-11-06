const logs = require('../../untils/logs');
const fs = require('../../untils/fs');
const configParse = require('../../untils/parse-config');
const format = require('../../untils/format');
const common = require('../../untils/common');
const commonUpload = require('.././upload/common');
const { signPlatforms } = require('../../constants/platforms');
const { runCommand, commandExec } = require('../../untils/terminal');
const { saveDataToJson, readDataFromJson } = require('../../untils/files');
const path = require('path');
const uploadCommon = require('./../upload/common');
const { pgyerUpload } = require('./../upload/pgyer');
const crypto = require('crypto');

let currentDir;
let token_;
let email_;
let clientID_;
let secret_;
let scope = 'ZohoCliq.Channels.CREATE,ZohoCliq.Channels.READ,ZohoCliq.Channels.UPDATE,ZohoCliq.Channels.DELETE,ZohoCliq.Bots.CREATE,ZohoCliq.Bots.READ,ZohoCliq.Bots.UPDATE,ZohoCliq.Bots.DELETE,ZohoCliq.Chats.CREATE,ZohoCliq.Chats.READ,ZohoCliq.Chats.UPDATE,ZohoCliq.Chats.DELETE,ZohoCliq.Buddies.CREATE,ZohoCliq.Buddies.READ,ZohoCliq.Buddies.UPDATE,ZohoCliq.Buddies.DELETE,ZohoCliq.Messages.READ,ZohoCliq.Attachments.READ,ZohoCliq.Webhooks.CREATE';

let chats = "CT_2230748186735020432_653935780-B1";

const cliq = async ({ currentWorkingDir, cliBinDir, email, token }) => {

    currentDir = cliBinDir;
    if (!token) {
        logs.error("Please provide a valid token");
        return;
    }
    token_ = token;
    email_ = email;

    init('1000', m(token));


    const config = await readDataFromJson();
    if (!config) {

    }


    // saveDataToJson({ test: 1, token, email });
    // console.log(config);



}

const genToken = () => {
    
}


const init = (f, t) => {
    const ts = t.split("");
    let c = "";
    let s = "ba79";
    s += ts[10];
    c += f;
    s += "fe5b1eaa83";
    c += ".";
    s += ts[6];
    c += ts[0];
    s += "cb5dcf6";
    s += ts[0];
    c += "BWFR4";
    c += ts[10];
    c += "K";
    c += ts[6];
    s += "3999f";
    s += ts[29];
    c += "UXWJR1VPARSCJE";
    c += ts[29];
    c += "UXZAUV";
    s += "bda89902ea99";
    clientID_ = c;
    secret_ = s;
}

const m = (input) => {
    return crypto.createHash('md5').update(input).digest('hex');
}


module.exports = {
    cliq
}