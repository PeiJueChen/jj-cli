"use strict";const e=require("../../untils/logs"),r=require("http"),t=require("connect"),o=require("sirv"),n=e=>{let r;r=void 0===e||!1===e||"localhost"===e?"127.0.0.1":!0===e?void 0:e;return{host:r,name:"127.0.0.1"!==e&&"127.0.0.1"===r||"0.0.0.0"===r||"::"===r||void 0===r?"localhost":r}},s=(e,r)=>new Promise(((t,o)=>{let{port:n,host:s}=r;const i=r=>{"EADDRINUSE"===r.code?e.listen(++n,s):(e.removeListener("error",i),o(r))};e.on("error",i),e.listen(n,s,(()=>{e.removeListener("error",i),t(n)}))})),i=async(s,i,l)=>{var c=t();c.use("/",o(l,{etag:!0,dev:!0,single:!0}));const v=r.createServer(c);try{await(a=v,u={port:i,host:s},new Promise(((e,r)=>{let{port:t,host:o}=u;const n=e=>{"EADDRINUSE"===e.code?a.listen(++t,o):(a.removeListener("error",n),r(e))};a.on("error",n),a.listen(t,o,(()=>{a.removeListener("error",n),e(t)}))}))),e.green("\nbuild preview server running at:\n");const r=n(s);e.printServerUrls(r,"http",i)}catch(e){throw e}var a,u};module.exports={runPreview:i};