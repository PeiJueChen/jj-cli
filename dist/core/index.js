"use strict";const e=require("fs"),i=require("path"),r=(r,s,t)=>{const n=o=>{e.readdirSync(o,{withFileTypes:!0}).forEach((e=>{const c=e.name;if(e.isFile()){if(~c.indexOf("help")||~c.indexOf("option")||~c.indexOf("create")){require(`${o}/${c}`)(r,s,t)}}else e.isDirectory()&&n(i.resolve(o,c))}))};n(__dirname)};module.exports=r;