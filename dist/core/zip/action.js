"use strict";const i=require("../../untils/logs"),e=require("../../untils/fs"),t=require("../../untils/common"),s=require("path"),l=require("adm-zip"),n=async(n,r,o,...a)=>{const c=new l;let u=!1;for(let t=0;t<a.length;t++){let l=a[t];if(t>0){let t=s.join(r,l);if(!e.existsSync(t)){i.logWarn(`${l} is not exist`);continue}const n=await e.lstatAsync(t);n.isFile()?(u=!0,c.addLocalFile(t)):n.isDirectory()&&(u=!0,c.addLocalFolder(t,l))}}if(u)try{await t.runTask("zip...",(async()=>{await c.writeZipPromise(n)}))}catch(i){throw i}else i.logFriendly("Could not find any valid files ")};module.exports={zip:n};