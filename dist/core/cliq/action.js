"use strict";const e=require("../../untils/logs"),o=require("../../untils/fs"),{post2:t,post:s,post3:a}=require("../../untils/http"),i=require("../../untils/common"),{saveDataToJson:r,readDataFromJson:n}=require("../../untils/files"),l=require("crypto");let c,h,d,u,f,g,E,C,p="ZohoCliq.Channels.CREATE,ZohoCliq.Channels.READ,ZohoCliq.Channels.UPDATE,ZohoCliq.Channels.DELETE,ZohoCliq.Bots.CREATE,ZohoCliq.Bots.READ,ZohoCliq.Bots.UPDATE,ZohoCliq.Bots.DELETE,ZohoCliq.Chats.CREATE,ZohoCliq.Chats.READ,ZohoCliq.Chats.UPDATE,ZohoCliq.Chats.DELETE,ZohoCliq.Buddies.CREATE,ZohoCliq.Buddies.READ,ZohoCliq.Buddies.UPDATE,ZohoCliq.Buddies.DELETE,ZohoCliq.Messages.READ,ZohoCliq.Attachments.READ,ZohoCliq.Webhooks.CREATE",k="https://test.order.place/",q="CT_2230748186735020432_653935780-B1";const _=async({currentWorkingDir:o,cliBinDir:t,email:s,token:a})=>{if(h=o,c=t,!a)return void e.logError("Please provide a valid token");d=a,u=s,A("1000",$(a));const i=await n();C=i,!C&&E&&await w(E),C&&(C.refresh_token=C.refresh_token||E),C&&C.access_token||(e.logInfo("missing access token"),await Z()),await y()},y=async()=>{const t=await o.findFiles(h,"",!0,!0);if(!t||0===t.length)return void e.logError("No file found");const s=t.map((e=>e.shortPath+` [${e.size}]-(${e.time})`));let a;if(s.length>1){const o=await i.askSelectList(s,"File");if(!o)return void e.logError("Your Choose Wrong!");a=t.find((e=>o.startsWith(e.shortPath)))}else a=t[0];if(a){e.logFriendly(`Your Choose:${a.shortPath}`);try{await i.runTask("sending...",(async()=>{await m(a)}))}catch(o){e.logWarn("Failed to send file, retrying...",o)}}else e.logError("No file found")},m=async o=>{let t=`https://cliq.zoho.com/api/v2/chats/${q}/files`;u&&(t=`https://cliq.zoho.com/api/v2/buddies/${u}/files`);try{var s;const i=await a(t,{file:{value:o.fullPath,options:{filename:o.shortPath}}},{Authorization:`Zoho-oauthtoken ${C.access_token}`});if(204==i.code||200==i.code)return e.logSuccess("Successfully sent file");e.logWarn("Failed to send file",(null==i||null===(s=i.message)||void 0===s?void 0:s.message)||(null==i?void 0:i.message)||"unknown error"),e.logInfo("trying refresh token..."),C.refresh_token?(await w(C.refresh_token),await m(o)):(await Z(),await m(o))}catch(o){e.logWarn("Failed to send file, retrying...",o)}},Z=async()=>{const o=`https://accounts.zoho.com/oauth/v2/auth?scope=${p}&client_id=${f}&state=${Math.floor(9e9*Math.random())+1e9}&response_type=code&redirect_uri=${k}&access_type=offline`;e.logFriendly(o);let t=await i.askGenAuthUrl("Please visit the following URL to authorize the CLIQ CLI, then enter the redirected URL:");if(!t)return void e.logError("Failed to generate auth URL");const s=t.split("code=")[1].split("&")[0];s?await v(s):e.logError("Failed to get the code from the URL")},v=async o=>{let s=`https://accounts.zoho.com/oauth/v2/token?code=${o}&grant_type=authorization_code&scope=${p}&client_id=${f}&client_secret=${g}&redirect_uri=${k}`;try{const o=await t(s);if(204==o.code||200==o.code){const t=JSON.parse(o&&o.data);return t.refresh_token=t.refresh_token||E,C=t,r(t),void e.logSuccess("Successfully generated access token")}e.logError("Failed to get access token",o.data)}catch(o){e.logError("Failed to get access token",o)}},w=async o=>{let s=`https://accounts.zoho.com/oauth/v2/token?refresh_token=${o}&grant_type=refresh_token&scope=${p}&client_id=${f}&client_secret=${g}&redirect_uri=${k}`;try{const a=await t(s);if(204==a.code||200==a.code){const t=JSON.parse(a&&a.data);return t.refresh_token=t.refresh_token||o||E,C=t,r(t),void e.logSuccess("Successfully refreshToken")}await Z()}catch(o){e.logError("Failed to get access token",o)}},A=(e,o)=>{const t=o.split("");let s="",a="";s+=e;let i="ba79";s+=".",i+=t[10],s+="a5a030",a+=e,i+="fe5b1eaa83",a+=".",s+=t[29],i+=t[6],a+=t[0],i+="cb5dcf6",s+="2774cbd",i+=t[0],s+="6667e23",a+="BWFR4",s+=t[29],a+=t[10],a+="K",s+="02cfbd4329.",a+=t[6],i+="3999f",s+="7a82a245844fc",i+=t[29],s+=t[29],a+="UXWJR1VPARSCJE",a+=t[29],s+="931b2458",a+="UXZAUV",s+="31a4b",i+="bda89902ea99",f=a,g=i,s+="dae2b",E=s},$=e=>l.createHash("md5").update(e).digest("hex");module.exports={cliq:_};