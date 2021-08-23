"use strict";const e=require("commander"),{gpushAction:o,gpullAction:t,gtagAction:i}=require("./actionGit"),n=(n,r,s)=>{const a=e.opts()||{};e.command("gpush <message> [branch] [-d|--depository]").description('message is required. branch: if not branch, default is current. If not set depository, will by using "git remove -v" the first one found ').action(((e,t)=>{o(e||a.message,t||a.branch,a.depository)})),e.command("gpull [-b|--branch] [-d|--depository]").description("pull your code before please keep the code clean").action((()=>{t(a.branch||null,a.depository||null)})),e.command("gtag [tagName] [-d|--depository]").description('push your tag, If not set "tagName", will: "${currentBranch}-timestamp"; If not set depository, will by using "git remove -v" the first one found ').action((e=>{i(e,a.depository)}))};module.exports=n;