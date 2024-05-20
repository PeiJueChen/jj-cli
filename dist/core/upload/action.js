"use strict";const a=require("../../untils/logs"),t=require("../../untils/common"),e=require("./common"),{runSpawnCommand:n}=require("../../untils/terminal"),r=require("../../untils/parse-config"),p=require("./../sign/action"),{pgyerUpload:o}=require("./pgyer"),i={ios:"ios",android:"android"};var l,c;const s=async(n,s,u,w,f,d,m,y,h)=>{l=d,c=m||s,await t.isInstalled("appcenter")||a.logFatal("Not found \"appcenter\", Please install first: 'npm install -g appcenter-cli'. ref: https://www.npmjs.com/package/appcenter-cli");const k=n&&n.toLowerCase().trim();var P=i[k];if(!P){let e=await t.askPlatform();if(!(P=i[e]))return void a.logFatal("Only support ios/android now.")}try{const{config:n,configPathDiretory:i}=await r.parseConfigPromise(c),u=await e.findPackageApp(P,s,f),w=u&&u.fullPath;try{var j=await r.askProjects(n,l)}catch(t){a.logFatal("Please write all `project` field as project name")}let d=g(j.pgyer),m=g(j.appcenter);if(d||m||a.logFatal("Cannot find your pgyer or appcenter config"),d&&m){const a=await t.askSelectList(["pgyer","appcenter"],"Website");d="pgyer"===a,m="appcenter"===a}m&&await p.uploadToAppcenter(w,j.appcenter,P,n.defaultAppcenterToken,y,h),d&&await o(P,w,j,n,h)}catch(a){e.uploadPlatform(P,s,w,f,h)}},g=a=>a&&Object.keys(a).length>0,u=async()=>{await t.isInstalled("appcenter")||a.logFatal("Not found \"appcenter\", Please install first: 'npm install -g appcenter-cli'. ref: https://www.npmjs.com/package/appcenter-cli");try{await t.runTask("logout...",(async()=>{await n("appcenter logout"),a.logInfo("~End~")}))}catch(a){throw a}},w=async()=>{await t.isInstalled("appcenter")||a.logFatal("Not found \"appcenter\", Please install first: 'npm install -g appcenter-cli'. ref: https://www.npmjs.com/package/appcenter-cli");try{await t.runTask("login...",(async()=>{await n("appcenter login"),a.logInfo("~End~")}))}catch(a){throw a}};module.exports={uploadApp:s,logoutAppcenter:u,loginAppcenter:w};