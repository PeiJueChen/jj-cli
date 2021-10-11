"use strict";const e=require("../../untils/logs"),n=require("../../untils/fs"),a=require("../../untils/parse-config"),t=require("../../untils/format"),o=require("../../untils/common"),s=require("../../constants/platforms"),{runCommand:i,commandExec:r}=require("../../untils/terminal"),l=require("path"),c=require("./../upload/common"),p="jj.config.json",g="C:\\Users\\aigens-pc\\Desktop\\Android-sign\\jj.config.json",u="/Users/chenpeijue/Desktop/Android-sign/jj.config.json",d="cc08d0408403c04968bcfbf738a7356bf6f4c8be";var f,y,m,j,k;const w=async({platform:n,currentWorkingDir:a,cliBinDir:t,projectname:o,folderpath:i,appcenter:r})=>{f=i||a,y=a,m=o,j=r;const l=n&&n.toLowerCase().trim();var c=s[l];if(!c)return void e.logFatal(`Only support ${Object.keys(s)} now.`);let p=new Map([["ios",async()=>{}],["android",async()=>{await A()}]]);k=c;const g=p.get(c);g&&g()},F=a=>{a||e.logFatal("Missing file");const t=l.resolve(f,...a.split("/"));return n.existsSync(t)||e.logFatal(`Cannot find file: ${a}`),t},h=a=>{const t=a.unsignedApk;var o=l.resolve(y,"app-release-unsigned.apk");if((s=o&&n.existsSync(o))||(s=(o=l.isAbsolute(t)&&l.resolve(t)||null)&&n.existsSync(o)),!s){o=l.resolve(f,...t.split("/"));var s=n.existsSync(o)}s||e.logFatal("Cannot find app-release-unsigned.apk"),a.unsignedApk=o},v=async()=>{const{config:e,configPathDiretory:n}=await a.parseConfig(f);return f=n,h(e),e},$=async(n,t)=>{try{return await a.askProjects(n,t)}catch(n){e.logFatal("Please write all `project` field as project name")}},C=async(e,a)=>{const o=a&&a.name,s=l.join(e,"../","signedApks");await n.mkdirAsyncRecursive(s);const i=`${o}-signed-${t.formatDate((new Date).getTime(),"yyyy-MM-dd-[hh-mm-ss]")}.apk`;return l.resolve(s,i)},b=e=>{n.existsSync(e)&&n.unlinkSync(e)},S=(e,n)=>{const a=l.join(e,"../",`${n}-unsigned-temp.apk`);return b(a),a};async function A(){await o.isInstalled("jarsigner")||e.logFatal("Cannot find `jarsigner`"),await o.isInstalled("zipalign")||e.logFatal("Cannot find `zipalign`");const n=await v(),a=n.unsignedApk,t=await $(n,m);e.logFriendly(`Your Project is : ${t.name}`);const s=t.keyStoreFile,i=F(s),c=t.alias||n.defaultAlias;c||e.logFatal("Cannot find alias");const p=t.storepass||t.keypass,g=t.keypass||t.storepass;p&&g||e.logFatal("Cannot find storepass / keypass");const u=await C(i,t),d=S(u,t.name);try{e.blue("................... Zipalign Start ..................."),await r(`zipalign -v -p 4 ${a} ${d}`),e.blue("................... Zipalign End ..................."),e.red("\n...........................................................................................\n"),e.blue("................... Sign Start ..................."),await r(`jarsigner -verbose -keystore ${i} -storepass ${p} -keypass ${g} -signedjar ${u} ${d} ${c}`),b(d),e.blue("................... Sign End ..................."),e.green(`Signed ${t.name}`),await o.openUrl(l.join(u,"../")),q(u,t.appcenter,k,n.defaultAppcenterToken)}catch(n){e.logError(n)}}const q=async(a,t,s=k,i="",r=j)=>{n.existsSync(a)||e.logFatal(`Cannot find your: ${a}`);const l=(t=t||{})[s]||{},p=Object.keys(l);if(0===p.length)return void e.logFriendly("Cannot find your appcenter config at jj.config.json");const g=r&&l[r];var u;if(g){g.userName&&g.appName&&g.group||e.logFatal("Please check your jj.config.json, Cannot find userName/appName/group"),u={...g,token:g.token||l.token||t.token||i||d,appPath:a,platform:s}}else{const n=p.filter((e=>{const n=l[e];return"object"==typeof n&&Object.keys(n).length>0&&n.userName&&n.appName&&n.group}));0===n.length&&e.logFatal("Please check your jj.config.json, Cannot find userName/appName/group"),e.logFriendly("Upload app to appcenter");var f=await o.askSelectList(n,"Group");const r=l[f];r||e.logFatal("Cannot find your Group info"),u={...r,token:r.token||l.token||t.token||i||d,appPath:a,platform:s}}c.uploadWithInfo(u)};module.exports={signPlatform:w,uploadToAppcenter:q};