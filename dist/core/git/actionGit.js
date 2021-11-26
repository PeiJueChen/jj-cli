"use strict";const{runSpawnCommand:a,commandExec:t,runCommand:i}=require("../../untils/terminal"),r="win32"===process.platform?"npm.cmd":"npm",s="win32"===process.platform?"":"bash ",n=require("path"),e=require("../../untils/common"),o=require("../../untils/logs"),l=require("../../untils/format"),c=async(a,t,r)=>{await e.isInstalled("git")||o.logFatal("Please install GIT first."),a||o.logFatal("Write your commit noted"),t=t||await m(),r=r||await y(),o.logInfo(`Your branch is: ${t}`),o.logInfo(`Your depository is: ${r}`);try{await e.runTask("add...",(async()=>{await i("git add .")})),await e.runTask("commit...",(async()=>{await i(`git commit -m "${a}"`)})),await e.runTask("push...",(async()=>{await i(`git push ${r} ${t}`)})),o.logFriendly("Exec Done")}catch(a){o.logError(a)}},u=async(a,t)=>{await e.isInstalled("git")||(o.logInfo("Please install GIT first."),process.exit(1)),t=t||await y(),a=a||await m();try{await e.runTask("fetch...",(async()=>{await i(`git fetch ${t}`)})),await e.runTask("pull...",(async()=>{await i(`git pull ${t} ${a}`)}))}catch(a){o.logError(a)}},g=async(a,t)=>{await e.isInstalled("git")||o.logFatal("Please install GIT first."),t=t||await y();const r=await m(),s=w();a=a||`${r}-${s}`;try{await e.runTask("tag...",(async()=>{await i(`git tag ${a}`)})),await e.runTask("push...",(async()=>{await i(`git push ${t} ${a}`)}))}catch(a){o.logError(a)}},m=async()=>{try{var a=await i("git rev-parse --abbrev-ref HEAD")}catch(t){a="master"}return a.replace(/\n/g,"")},w=async()=>l.formatDate((new Date).getTime(),"yyyy-MM-dd-hhmmss"),y=async()=>{const a=await i("git remote -v");try{var t=a.split(" ")[0].split("\t")[0]}catch(a){t="origin"}return t};module.exports={gpushAction:c,gpullAction:u,gtagAction:g};