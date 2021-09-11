// const logs = require('../../untils/logs');
const liveServer = require("live-server");
// const http = require('http');
// const connect = require('connect');
// const sirv = require('sirv');

// const resolveHostname = (optionsHost) => {
//     let host;
//     if (
//         optionsHost === undefined ||
//         optionsHost === false ||
//         optionsHost === 'localhost'
//     ) {
//         // Use a secure default
//         host = '127.0.0.1'
//     } else if (optionsHost === true) {
//         // If passed --host in the CLI without arguments
//         host = undefined // undefined typically means 0.0.0.0 or :: (listen on all IPs)
//     } else {
//         host = optionsHost
//     }
//     // Set host name to localhost when possible, unless the user explicitly asked for '127.0.0.1'
//     const name =
//         (optionsHost !== '127.0.0.1' && host === '127.0.0.1') ||
//             host === '0.0.0.0' ||
//             host === '::' ||
//             host === undefined
//             ? 'localhost'
//             : host
//     return { host, name }
// }

/*
serverOptions: {
    port: number
    host: string | undefined
  }
*/
// const httpServerStart = (httpServer, serverOptions) => {
//     return new Promise((resolve, reject) => {
//         let { port, host } = serverOptions

//         const onError = (e) => {
//             if (e.code === 'EADDRINUSE') {
//                 // logger.info(`Port ${port} is in use, trying another one...`)
//                 httpServer.listen(++port, host)
//             } else {
//                 httpServer.removeListener('error', onError)
//                 reject(e)
//             }
//         }

//         httpServer.on('error', onError)

//         httpServer.listen(port, host, () => {
//             httpServer.removeListener('error', onError)
//             resolve(port)
//         })
//     })
// }

// const runPreview = async (host, port, staticPath) => {

//     var app = connect();

//     app.use(
//         "/",
//         sirv(staticPath, {
//             etag: true,
//             dev: true,
//             single: true
//         })
//     )
//     const server = http.createServer(app);
//     try {
//         await httpServerStart(server, {
//             port,
//             host
//         })
//         logs.green(`\nbuild preview server running at:\n`)
//         const hostname = resolveHostname(host);
//         logs.printServerUrls(hostname, 'http', port);
//     } catch (error) {
//         throw error;
//     }
// }

const runPreview = async (host, port, staticPath) => {

    const params = {
        port, // Set the server port. Defaults to 8080.
        host, // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
        root: staticPath, // Set root directory that's being served. Defaults to cwd.
        open:  true, // When false, it won't load your browser by default.
        // 要 ignore的文件, ignore:["./test.js"]
        ignore: [/\.git\//, /\.svn\//, /\.hg\//],
        // file: "index.html", // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
        wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
        // 添加需要再監聽的文件路徑/或文件夾, 本功能不用再監聽 node_modules 文件的變化
        // mount: [['./node_modules']], // Mount a directory to a route.
        logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
        middleware: [function (req, res, next) { next(); }] // Takes an array of Connect-compatible middleware that are injected into the server middleware stack
    };
    liveServer.start(params);
}

module.exports = {
    runPreview
}