"use strict";const e=require("../../untils/logs"),s=require("../../untils/fs"),t=require("../../untils/format"),n=require("../../untils/common"),a=require("../../constants/platforms"),{runCommand:i,commandExec:o}=require("../../untils/terminal"),r=require("path"),l="sign.config.json",c="",p="/Users/chenpeijue/Desktop/Android-sign/sign.config.json";var g,u;const d=async(s,t,n,i)=>{g=t,u=i;const o=s&&s.toLowerCase().trim();var r=a[o];if(!r)return void e.logFatal(`Only support ${Object.keys(a)} now.`);const l=new Map([["ios",async()=>{}],["android",async()=>{await w(r)}]]).get(s);l&&l()},f=t=>{t||e.logFatal("Missing file");const n=r.resolve(g,...t.split("/"));return s.existsSync(n)||e.logFatal(`Cannot find file: ${t}`),n},y=async()=>{let t=r.resolve(g,l);s.existsSync(t)||(t="win32"===process.platform?"":"darwin"===process.platform?p:"",t&&s.existsSync(t)||e.logFatal("Cannot find sign config file"),g=r.join(t,"../"));var n=await s.readFileContentAsync(t);return n||e.logFatal(`${l} is empty.`),"string"==typeof n&&(n=JSON.parse(n)),n},m=async s=>{const t=s.projects||[];if(u){const e=t.find((e=>~e.project.indexOf(u)));if(e)return e}const a=t.map((e=>e&&e.project||""));a.some((e=>!e))&&e.logFatal("Please write all `project` field as project name");const i=await n.askSelectList(a,"Project");return t.find((e=>e.project===i))},j=async(e,n)=>{const a=n&&n.project,i=r.join(e,"../","signedOutApk");await s.mkdirAsyncRecursive(i);const o=`${a}-signed-${t.formatDate((new Date).getTime(),"yyyy-MM-dd-[hh-mm-ss]")}.apk`;return r.resolve(i,o)};async function w(s){await n.isInstalled("jarsigner")||e.logFatal("Cannot find `jarsigner`, Please install first.");const t=await y(),a=t.unsignedApk,i=f(a),l=await m(t);e.logFriendly(`Your Project is : ${l.project}`);const c=l.keyStoreFile,p=f(c),g=l.alias||t.defaultAlias;g||e.logFatal("Cannot find alias");const u=l.storepass||l.keypass,d=l.keypass||l.storepass;u&&d||e.logFatal("Cannot find storepass / keypass");const w=await j(p,l);try{e.blue("Start Sign..."),await o(`jarsigner -verbose -keystore ${p} -storepass ${u} -keypass ${d} -signedjar ${w} ${i} ${g}`),e.green(`Signed ${l.project}`);const s=await Promise.resolve().then((()=>require("open")));await s(r.join(w,"../"),{wait:!1})}catch(s){e.logError(s)}}module.exports={signPlatform:d};