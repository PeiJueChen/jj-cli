"use strict";const i=require("../../untils/logs"),e=require("../../untils/fs"),t=require("../../untils/common"),o=require("path"),s=require("adm-zip"),l=async(l,n,r,...a)=>{console.log("outputName:",l,n,r,a);const c=new s;let u=!1;for(let t=0;t<a.length;t++){let s=a[t];if(t>0){let t=o.join(n,s);if(!e.existsSync(t)){i.logWarn(`${s} is not exist`);continue}const l=await e.lstatAsync(t);l.isFile()?(u=!0,c.addLocalFile(t)):l.isDirectory()&&(u=!0,c.addLocalFolder(t,s))}}if(u)try{await t.runTask("zip...",(async()=>{await c.writeZipPromise(l)}))}catch(i){throw i}else i.logFriendly("Could not find any valid files ")};module.exports={zip:l};