"use strict";const e=require("commander"),{runCommand:t}=require("../../untils/terminal"),o=require("../../untils/logs"),{zip:i}=require("./action"),r=(r,l,u)=>{const n=e.opts()||{};e.command("zip [-output|--output]").description("Help you zip file or folder").action((async r=>{let s=n.output;if(!s){let e=await t("date +'%Y-%m-%d-%H%M%S'");e=e.replace(/\n/g,""),s=`build-${e}.zip`}let a=e.args;1!=a.length?i(s,l,u,...a):o.logFatal("Please write down the files you need to compress.")}))};module.exports=r;