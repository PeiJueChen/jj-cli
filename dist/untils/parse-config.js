"use strict";const e=require("path"),s=require("./fs"),n=require("./logs"),i=require("./common"),o="jj.config.json",r="C:\\Users\\aigens-pc\\Desktop\\Android-sign\\jj.config.json",t="/Users/chenpeijue/Desktop/Android-sign/jj.config.json";exports.parseConfig=async i=>{let a=e.resolve(i,o);s.existsSync(a)||(a="win32"===process.platform?r:"darwin"===process.platform?t:"",a&&s.existsSync(a)||n.logFatal("Cannot find sign config file"),i=e.join(a,"../"));var c=await s.readFileContentAsync(a);return c||n.logFatal(`${o} is empty.`),"string"==typeof c&&(c=JSON.parse(c)),{config:c,configPathDiretory:i}},exports.parseConfigPromise=i=>new Promise((async(a,c)=>{let f=e.resolve(i,o);s.existsSync(f)||(f="win32"===process.platform?r:"darwin"===process.platform?t:"",f&&s.existsSync(f)||c("Cannot find sign config file"),i=e.join(f,"../"));var p=await s.readFileContentAsync(f);p||n.logFatal(`${o} is empty.`),"string"==typeof p&&(p=JSON.parse(p)),a({config:p,configPathDiretory:i})})),exports.askProjects=(e,s)=>new Promise((async(n,o)=>{const r=e.projects||[];if(s){const e=r.find((e=>~e.name.indexOf(s)));if(e)return void n(e)}const t=r.map((e=>e&&e.name||""));t.some((e=>!e))&&o("Please write all `name` field as project name");const a=await i.askSelectList(t,"Project");n(r.find((e=>e.name===a)))}));