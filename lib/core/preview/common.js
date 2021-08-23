const logs = require('../../untils/logs');
const http = require('http');
const connect = require('connect');
const sirv = require('sirv');

const resolveHostname = (optionsHost) => {
    let host;
    if (
        optionsHost === undefined ||
        optionsHost === false ||
        optionsHost === 'localhost'
    ) {
        // Use a secure default
        host = '127.0.0.1'
    } else if (optionsHost === true) {
        // If passed --host in the CLI without arguments
        host = undefined // undefined typically means 0.0.0.0 or :: (listen on all IPs)
    } else {
        host = optionsHost
    }
    // Set host name to localhost when possible, unless the user explicitly asked for '127.0.0.1'
    const name =
        (optionsHost !== '127.0.0.1' && host === '127.0.0.1') ||
            host === '0.0.0.0' ||
            host === '::' ||
            host === undefined
            ? 'localhost'
            : host
    return { host, name }
}

/*
serverOptions: {
    port: number
    host: string | undefined
  }
*/
const httpServerStart = (httpServer, serverOptions) => {
    return new Promise((resolve, reject) => {
        let { port, host } = serverOptions

        const onError = (e) => {
            if (e.code === 'EADDRINUSE') {
                // logger.info(`Port ${port} is in use, trying another one...`)
                httpServer.listen(++port, host)
            } else {
                httpServer.removeListener('error', onError)
                reject(e)
            }
        }

        httpServer.on('error', onError)

        httpServer.listen(port, host, () => {
            httpServer.removeListener('error', onError)
            resolve(port)
        })
    })
}

const runPreview = async (host, port, staticPath) => {

    var app = connect();

    app.use(
        "/",
        sirv(staticPath, {
            etag: true,
            dev: true,
            single: true
        })
    )
    const server = http.createServer(app);
    try {
        await httpServerStart(server, {
            port,
            host
        })
        logs.green(`\nbuild preview server running at:\n`)
        const hostname = resolveHostname(host);
        logs.printServerUrls(hostname, 'http', port);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    runPreview
}