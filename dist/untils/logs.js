"use strict";const o=require("chalk"),e=require("os");function r(...o){console.log(...o)}function n(...e){console.log(o.green("[success]"),...e)}function s(...e){console.log(o.bold.cyan("[info]"),...e)}function l(...e){console.log(o.bold.yellow("[warn]"),...e)}function c(...e){return console.error(o.red("[error]"),...e),process.exit(1)}function t(...o){return c(...o),process.exit(1)}function a(...e){console.log(o.yellow("[Friendly]"),...e)}exports.log=r,exports.logSuccess=n,exports.logInfo=s,exports.logWarn=l,exports.logError=c,exports.logFatal=t,exports.logFriendly=a;const d=(...e)=>{console.log(o.cyan.bold(o.cyan(...e)))};exports.cyan=d;const p=(...e)=>{console.log(o.cyan.bold(o.green(...e)))};exports.green=p;const u=(...e)=>{console.log(o.cyan.bold(o.blue(...e)))};exports.blue=u,exports.red=(...e)=>{console.log(o.cyan.bold(o.red(...e)))},exports.grey=(...e)=>{console.log(o.cyan.bold(o.grey(...e)))},exports.printServerUrls=(r,n,s)=>{if("127.0.0.1"===r.host){const e=`${n}://${r.name}:${o.bold(s)}`;a(`  > Local: ${o.cyan(e)}`),"127.0.0.1"!==r.name&&a(`  > Network: ${o.dim("use `--host` to expose")}`)}else{const l=Object.values(e.networkInterfaces()),c=[];l.forEach((o=>c.push(...o))),c.filter((o=>"IPv4"===o.family)).map((e=>{const l=e.address.includes("127.0.0.1")?"Local:   ":"Network: ",c=e.address.replace("127.0.0.1",r.name),t=`${n}://${c}:${o.bold(s)}`;return`  > ${l} ${o.cyan(t)}`})).forEach((o=>a(o)))}},exports.logIpAddress=()=>{const r=Object.values(e.networkInterfaces()),n=[];r.forEach((o=>n.push(...o))),n.filter((o=>"IPv4"===o.family)).map((e=>{if("127.0.0.1"!==e.address){const r=`http://${e.address}`;return`\n> Your Ip:  ${o.cyan(r)}\n`}})).forEach((o=>o&&console.log(o)))};