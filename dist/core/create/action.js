"use strict";const e=require("../../untils/common"),t=require("../../untils/logs"),o=require("../../untils/fs"),r=require("./../../constants/envs"),n=require("./common"),s=async(o,s,a,i,c)=>{var l=r[o];if(!l){let o=await e.askChoose("Env",Object.keys(r));if(!(l=r[o]))return void t.logFatal(`Only support ${r} now.`)}if("python"!==l||c)try{await n.create(l,s,a,i,c)}catch(e){t.logFatal(e)}else t.logFatal("Missing your project name, you can: -pn xxxx")};module.exports={createAction:s};