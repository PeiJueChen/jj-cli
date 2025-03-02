"use strict";const e=require("../../untils/common"),o=require("../../untils/logs"),{uploadToPgyer:t,getNextVerion:a,updateInfo:n,clearAllVersions:l}=require("../../untils/pgyer-api"),{getSizeByPath:i}=require("../../untils/fs"),r=async(a,l,r,s,u,c,p,y)=>{var g,d,v,f,j;const h=r&&r.pgyer||{};let w=h[a.toLocaleLowerCase()];if(!c){const t=Object.keys(w);if(0===t.length)return void o.logFatal("Cannot find your appcenter config at jj.config.json");const a=t.filter((e=>{const o=w[e];return"object"==typeof o&&Object.keys(o).length>0}));0===a.length&&o.logFatal("Please check your jj.config.json, Cannot find pgyer group"),c=await e.askSelectList(a,"Group")}"phase2uat"!=c&&"uatphase2"!=c||(c="uat");let K=(null===(g=w)||void 0===g?void 0:g[`v4${c}`])||(null===(d=w)||void 0===d?void 0:d[`${c}`]);var P;K&&0!==Object.keys(K).length||!c.includes("v4")||(c=c.replace("v4",""),K=null===(P=w)||void 0===P?void 0:P[`${c}`]);w=K,w&&0!==Object.keys(w).length||o.logFatal("Please set your pgy config");const k=w.apiKey||h.apiKey||s.defaultPgyerApiKey,b=w.userKey||h.userKey||s.defaultPgyerUserKey,F=(null===(v=w)||void 0===v?void 0:v.buildPassword)||(null==h?void 0:h.buildPassword),$=null===(f=w)||void 0===f?void 0:f.appKey,L=null===(j=w)||void 0===j?void 0:j.channel;k&&$||o.logFatal("Please set your apiKey & appKey of pgy first.");const O=await i(l);let U=`\n        Start Uploading...\n\n        Upload To "pgy": (https://www.pgyer.com)\n\n        Your Project name: ${r.name}\n\n        Your App: ${l}\n\n        Size: ${O}\n\n        `;F&&(U+=`\n        Your Build Password: ${F} \n\n        `),o.green(U);try{var m=await t(r.name,a.toLocaleLowerCase(),k,l,L,p,c,y,b);if(!((null==m?void 0:m.openLink)||""))return void o.logFatal("\n\n Upload Failure");o.green("\n\nUpload Successful. \n")}catch(e){o.logFatal("\n\n Upload Failure")}try{await n(k,$,F)}catch(e){}!u&&url&&await e.openUrl(url),process.exit(0)},s=async(t,n,i,r)=>{var s,u,c;const p=n&&n.pgyer||{};let y=p[t.toLocaleLowerCase()];if(!r){const t=Object.keys(y);if(0===t.length)return void o.logFatal("Cannot find your appcenter config at jj.config.json");const a=t.filter((e=>{const o=y[e];return"object"==typeof o&&Object.keys(o).length>0}));0===a.length&&o.logFatal("Please check your jj.config.json, Cannot find pgyer group"),r=await e.askSelectList(a,"Group")}"phase2uat"!=r&&"uatphase2"!=r||(r="uat");let g=(null===(s=y)||void 0===s?void 0:s[`v4${r}`])||(null===(u=y)||void 0===u?void 0:u[`${r}`]);var d;g&&0!==Object.keys(g).length||!r.includes("v4")||(r=r.replace("v4",""),g=null===(d=y)||void 0===d?void 0:d[`${r}`]);y=g,y&&0!==Object.keys(y).length||o.logFatal("Please set your pgy config");const v=y.apiKey||p.apiKey||i.defaultPgyerApiKey,f=null===(c=y)||void 0===c?void 0:c.appKey;v&&f||o.logFatal("Please set your apiKey & appKey of pgy first.");try{l();var j=await a(v,f,r);console.log(j),process.exit(0)}catch(e){process.exit(1)}};module.exports={pgyerUpload:r,getNextVersion:s};