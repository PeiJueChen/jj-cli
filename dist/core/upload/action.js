"use strict";const a=require("../../untils/logs"),t=require("../../untils/common"),e=require("./common"),{runSpawnCommand:n}=require("../../untils/terminal"),r=require("../../untils/parse-config"),p=require("./../sign/action"),{pgyerUpload:o}=require("./pgyer"),i={ios:"ios",android:"android"};var l,c;const s=async(n,s,u,w,f,d,m,y)=>{l=d,c=m||s,await t.isInstalled("appcenter")||a.logFatal("Not found \"appcenter\", Please install first: 'npm install -g appcenter-cli'. ref: https://www.npmjs.com/package/appcenter-cli");const h=n&&n.toLowerCase().trim();var k=i[h];if(!k){let e=await t.askPlatform();if(!(k=i[e]))return void a.logFatal("Only support ios/android now.")}try{const{config:n,configPathDiretory:i}=await r.parseConfigPromise(c),u=await e.findPackageApp(k,s,f),w=u&&u.fullPath;try{var P=await r.askProjects(n,l)}catch(t){a.logFatal("Please write all `project` field as project name")}let d=g(P.pgyer),m=g(P.appcenter);if(d||m||a.logFatal("Cannot find your pgyer or appcenter config"),d&&m){const a=await t.askSelectList(["pgyer","appcenter"],"Website");d="pgyer"===a,m="appcenter"===a}m&&await p.uploadToAppcenter(w,P.appcenter,k,n.defaultAppcenterToken,y),d&&await o(k,w,P,n)}catch(a){e.uploadPlatform(k,s,w,f)}},g=a=>a&&Object.keys(a).length>0,u=async()=>{await t.isInstalled("appcenter")||a.logFatal("Not found \"appcenter\", Please install first: 'npm install -g appcenter-cli'. ref: https://www.npmjs.com/package/appcenter-cli");try{await t.runTask("logout...",(async()=>{await n("appcenter logout"),a.logInfo("~End~")}))}catch(a){throw a}},w=async()=>{await t.isInstalled("appcenter")||a.logFatal("Not found \"appcenter\", Please install first: 'npm install -g appcenter-cli'. ref: https://www.npmjs.com/package/appcenter-cli");try{await t.runTask("login...",(async()=>{await n("appcenter login"),a.logInfo("~End~")}))}catch(a){throw a}};module.exports={uploadApp:s,logoutAppcenter:u,loginAppcenter:w};