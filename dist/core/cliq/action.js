"use strict";const e=require("../../untils/logs"),o=require("../../untils/fs"),{post2:t,post:r,post3:s}=require("../../untils/http"),i=require("../../untils/parse-config"),a=require("../../untils/format"),n=require("../../untils/common"),l=require(".././upload/common"),{signPlatforms:c}=require("../../constants/platforms"),{runCommand:h,commandExec:d}=require("../../untils/terminal"),{saveDataToJson:u,readDataFromJson:f}=require("../../untils/files"),g=require("path"),p=require("./../upload/common"),{pgyerUpload:E}=require("./../upload/pgyer"),C=require("crypto"),{config:q}=require("process");let m,k,_,y,Z,v,w,A,$="ZohoCliq.Channels.CREATE,ZohoCliq.Channels.READ,ZohoCliq.Channels.UPDATE,ZohoCliq.Channels.DELETE,ZohoCliq.Bots.CREATE,ZohoCliq.Bots.READ,ZohoCliq.Bots.UPDATE,ZohoCliq.Bots.DELETE,ZohoCliq.Chats.CREATE,ZohoCliq.Chats.READ,ZohoCliq.Chats.UPDATE,ZohoCliq.Chats.DELETE,ZohoCliq.Buddies.CREATE,ZohoCliq.Buddies.READ,ZohoCliq.Buddies.UPDATE,ZohoCliq.Buddies.DELETE,ZohoCliq.Messages.READ,ZohoCliq.Attachments.READ,ZohoCliq.Webhooks.CREATE",D="https://test.order.place/",R="CT_2230748186735020432_653935780-B1";const T=async({currentWorkingDir:o,cliBinDir:t,email:r,token:s})=>{if(k=o,m=t,!s)return void e.error("Please provide a valid token");_=s,y=r,L("1000",S(s));const i=await f();i||await U(),i&&(i.refresh_token=i.refresh_token||w),A=i,A&&A.access_token||(e.logInfo("missing access token"),await U()),await F()},F=async()=>{const t=await o.findFiles(k,"",!0,!0);if(!t||0===t.length)return void e.logError("No file found");const r=t.map((e=>e.shortPath+` [${e.size}]-(${e.time})`));let s;if(r.length>1){const o=await n.askSelectList(r,"File");if(!o)return void e.logError("Your Choose Wrong!");s=t.find((e=>o.startsWith(e.shortPath)))}else s=t[0];if(s){e.logFriendly(`Your Choose:${s.shortPath}`);try{await n.runTask("sending...",(async()=>{await P(s)}))}catch(o){e.logWarn("Failed to send file, retrying...",o)}}else e.logError("No file found")},P=async o=>{let t=`https://cliq.zoho.com/api/v2/chats/${R}/files`;y&&(t=`https://cliq.zoho.com/api/v2/buddies/${y}/files`);try{var r;const i=await s(t,{file:{value:o.fullPath,options:{filename:o.shortPath}}},{Authorization:`Zoho-oauthtoken ${A.access_token}`});if(204==i.code||200==i.code)return e.logSuccess("Successfully sent file");e.logWarn("Failed to send file",(null==i||null===(r=i.message)||void 0===r?void 0:r.message)||(null==i?void 0:i.message)||"unknown error"),e.logInfo("trying refresh token..."),A.refresh_token?(await B(A.refresh_token),await P(o)):(await U(),await P(o))}catch(o){e.logWarn("Failed to send file, retrying...",o)}},U=async()=>{const o=`https://accounts.zoho.com/oauth/v2/auth?scope=${$}&client_id=${Z}&state=${Math.floor(9e9*Math.random())+1e9}&response_type=code&redirect_uri=${D}&access_type=offline`;e.logFriendly(o);let t=await n.askGenAuthUrl("Please visit the following URL to authorize the CLIQ CLI, then enter the redirected URL:");if(!t)return void e.logError("Failed to generate auth URL");const r=t.split("code=")[1].split("&")[0];r?await b(r):e.logError("Failed to get the code from the URL")},b=async o=>{let r=`https://accounts.zoho.com/oauth/v2/token?code=${o}&grant_type=authorization_code&scope=${$}&client_id=${Z}&client_secret=${v}&redirect_uri=${D}`;try{const o=await t(r);if(204==o.code||200==o.code){const t=JSON.parse(o&&o.data);return t.refresh_token=t.refresh_token||w,A=t,u(t),void e.logSuccess("Successfully generated access token")}e.logError("Failed to get access token",o.data)}catch(o){e.logError("Failed to get access token",o)}},B=async o=>{let r=`https://accounts.zoho.com/oauth/v2/token?refresh_token=${o}&grant_type=refresh_token&scope=${$}&client_id=${Z}&client_secret=${v}&redirect_uri=${D}`;try{const s=await t(r);if(204==s.code||200==s.code){const t=JSON.parse(s&&s.data);return t.refresh_token=t.refresh_token||o||w,A=t,u(t),void e.logSuccess("Successfully refreshToken")}await U()}catch(o){e.logError("Failed to get access token",o)}},L=(e,o)=>{const t=o.split("");let r="",s="";r+=e;let i="ba79";r+=".",i+=t[10],r+="a5a030",s+=e,i+="fe5b1eaa83",s+=".",r+=t[29],i+=t[6],s+=t[0],i+="cb5dcf6",r+="2774cbd",i+=t[0],r+="6667e23",s+="BWFR4",r+=t[29],s+=t[10],s+="K",r+="02cfbd4329.",s+=t[6],i+="3999f",r+="7a82a245844fc",i+=t[29],r+=t[29],s+="UXWJR1VPARSCJE",s+=t[29],r+="931b2458",s+="UXZAUV",r+="31a4b",i+="bda89902ea99",Z=s,v=i,r+="dae2b",w=r},S=e=>C.createHash("md5").update(e).digest("hex");module.exports={cliq:T};