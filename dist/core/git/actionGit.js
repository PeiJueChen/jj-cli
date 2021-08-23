"use strict";const{runSpawnCommand:a,commandExec:t,runCommand:i}=require("../../untils/terminal"),r="win32"===process.platform?"npm.cmd":"npm",s="win32"===process.platform?"":"bash ",n=require("path"),e=require("../../untils/common"),l=require("../../untils/logs"),o=async(a,t,r)=>{await e.isInstalled("git")||l.logFatal("Please install GIT first."),a||l.logFatal("Write your commit noted"),t=t||await u(),r=r||await m(),l.logInfo(`Your branch is: ${t}`),l.logInfo(`Your depository is: ${r}`);try{await e.runTask("add...",(async()=>{await i("git add .")})),await e.runTask("commit...",(async()=>{await i(`git commit -m "${a}"`)})),await e.runTask("push...",(async()=>{await i(`git push ${r} ${t}`)})),l.logFriendly("Exec Done")}catch(a){l.logError(a)}},c=async(a,t)=>{await e.isInstalled("git")||(l.logInfo("Please install GIT first."),process.exit(1)),t=t||await m(),a=a||await u();try{await e.runTask("fetch...",(async()=>{await i(`git fetch ${t}`)})),await e.runTask("pull...",(async()=>{await i(`git pull ${t} ${a}`)}))}catch(a){l.logError(a)}},g=async(a,t)=>{await e.isInstalled("git")||l.logFatal("Please install GIT first."),t=t||await m();const r=await u(),s=await w();a=a||`${r}-${s}`;try{await e.runTask("tag...",(async()=>{await i(`git tag ${a}`)})),await e.runTask("push...",(async()=>{await i(`git push ${t} ${a}`)}))}catch(a){l.logError(a)}},u=async()=>{try{var a=await i("git rev-parse --abbrev-ref HEAD")}catch(t){a="master"}return a.replace(/\n/g,"")},w=async()=>(await i("date +'%Y-%m-%d-%H%M%S'")).replace(/\n/g,""),m=async()=>{const a=await i("git remote -v");try{var t=a.split(" ")[0].split("\t")[0]}catch(a){t="origin"}return t};module.exports={gpushAction:o,gpullAction:c,gtagAction:g};