"use strict";const e=require("https"),t=require("fs"),n=require("querystring"),o=require("form-data");module.exports=function(r){const a="[PGYER APP UPLOADER]";let i="";function l(l){const s=n.stringify({...i,_api_key:r,buildType:i.filePath.split(".").pop()});i.log&&console.log(a+" Check API Key ... Please Wait ...");const u=e.request({hostname:"www.pgyer.com",path:"/apiv2/app/getCOSToken",method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","Content-Length":s.length}},(e=>{if(200!==e.statusCode)return void l(new Error(a+"Service down: cannot get upload token."),null);let n="";e.on("data",(e=>{n+=e.toString()})),e.on("end",(()=>{const e=n.toString();try{const n=JSON.parse(e);if(n.code)return void l(new Error(a+"Service down: "+n.code+": "+n.message),null);!function(e){i.log&&console.log(a+" Uploading app ... Please Wait ...");if(!t.existsSync(i.filePath))return void l(new Error(a+" filePath: file not exist"),null);const n=t.statSync(i.filePath);if(!n||!n.isFile())return void l(new Error(a+" filePath: path not a file"),null);const r=new o;r.append("signature",e.data.params.signature),r.append("x-cos-security-token",e.data.params["x-cos-security-token"]),r.append("key",e.data.params.key),r.append("x-cos-meta-file-name",i.filePath.replace(/^.*[\\\/]/,"")),r.append("file",t.createReadStream(i.filePath)),r.submit(e.data.endpoint,(function(t,n){t?l(t,null):204===n.statusCode?(setTimeout((()=>d(e)),1e3),c=0):l(new Error(a+" Upload Error!"),null)}))}(n)}catch(e){l(e,null)}}))}));u.write(s),u.end();var c=0;function d(t){const n=e.request({hostname:"www.pgyer.com",path:"/apiv2/app/buildInfo?_api_key="+r+"&buildKey="+t.data.key,method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","Content-Length":0}},(e=>{if(200!==e.statusCode)return void l(new Error(a+" Service is down."),null);let n="";e.on("data",(e=>{n+=e.toString()})),e.on("end",(()=>{const e=n.toString();try{const n=JSON.parse(e);if(c>=10)return void l(null,n);if(c++,1247===n.code)return i.log&&console.log(a+" Parsing App Data ... Please Wait ..."),void setTimeout((()=>d(t)),1e3);n.code&&l(new Error(a+"Service down: "+n.code+": "+n.message),null),l(null,n)}catch(e){l(e,null)}}))}));n.write(s),n.end()}}this.upload=function(e,t){if(e&&"string"==typeof e.filePath)return i=e,"function"==typeof t?(l(t),null):new Promise((function(e,t){l((function(n,o){return null===n?e(o):t(n)}))}));throw new Error("filePath must be a string")}};