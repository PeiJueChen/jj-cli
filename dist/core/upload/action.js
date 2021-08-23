"use strict";const a=require("../../untils/logs"),t=require("../../untils/common"),n=require("./common"),{runSpawnCommand:e}=require("../../untils/terminal"),l={ios:"ios",android:"android"},o=async(e,o,p,r,i)=>{await t.isInstalled("appcenter")||a.logFatal("Not found \"appcenter\", Please install first: 'npm install -g appcenter-cli'. ref: https://www.npmjs.com/package/appcenter-cli");const s=e&&e.toLowerCase().trim();var c=l[s];if(!c){let n=await t.askPlatform();if(!(c=l[n]))return void a.logFatal("Only support ios/android now.")}n.uploadPlatform(c,o,r,i)},p=async()=>{await t.isInstalled("appcenter")||a.logFatal("Not found \"appcenter\", Please install first: 'npm install -g appcenter-cli'. ref: https://www.npmjs.com/package/appcenter-cli");try{await t.runTask("logout...",(async()=>{await e("appcenter logout"),a.logInfo("~End~")}))}catch(a){throw a}},r=async()=>{await t.isInstalled("appcenter")||a.logFatal("Not found \"appcenter\", Please install first: 'npm install -g appcenter-cli'. ref: https://www.npmjs.com/package/appcenter-cli");try{await t.runTask("login...",(async()=>{await e("appcenter login"),a.logInfo("~End~")}))}catch(a){throw a}};module.exports={uploadApp:o,logoutAppcenter:p,loginAppcenter:r};