// const liveServer = require("live-server");
const logs = require('../../untils/logs');
const http = require('http');
const connect = require('connect');
const sirv = require('sirv');
const chokidar = require('chokidar');
const path = require('path');
const WebSocket = require('faye-websocket');
const fs = require('fs');
// const url = require('url');
// const send = require('send');
// const es = require("event-stream");
const { replaceContent } = require('../../untils/fs');

var LiveServer = {
	clients: [],
	watcher: null,
    server: null,
    shutdown: () => {}
};
const runWatcher = (watchPaths) => {
    const ignored = [/\.git\//, /\.svn\//, /\.hg\//];
    const watcher = chokidar.watch(watchPaths, {
        ignored: ignored,
        ignoreInitial: true
    });
    watch(watcher);
    LiveServer.watcher = watcher;
    return watcher
}
const handleChange = (changePath) => {
    var cssChange = path.extname(changePath) === ".css";
    // if (cssChange) logs.logInfo('CSS change detected:', changePath);
    // else logs.logInfo('Change detected:', changePath);
    LiveServer.clients.forEach(function (ws) {
        if (ws) ws.send(cssChange ? 'refreshcss' : 'reload');
    });
    logs.logInfo('building...')
}

const watch = (watcher) => {
    if (!watcher) return;
    watcher
        .on("change", handleChange)
        .on("add", handleChange)
        .on("unlink", handleChange)
        .on("addDir", handleChange)
        .on("unlinkDir", handleChange)
        .on("ready", function () {
            logs.logInfo('Ready for changes');
        })
        .on("error", function (err) {
            logs.logInfo('watcher ERROR:', err);
        });
}


const runInject = (staticPath) => {

    const indexPath = path.resolve(staticPath, 'index.html');
    let contents = fs.readFileSync(indexPath, "utf8");
    if (~contents.indexOf('Code injected by jj-cli')) {
        logs.logFriendly('Inject Code Already Exists.')
        return;
    }
    let INJECTED_CODE = fs.readFileSync(path.join(__dirname, "injected.html"), "utf8");
    const injectCandidates = [new RegExp("</body>", "i"), new RegExp("</head>", "i"), new RegExp("</svg>"), new RegExp("</script>", "i")];
    let match, injectTag;
    for (var i = 0; i < injectCandidates.length; ++i) {
        match = injectCandidates[i].exec(contents);
        m = match && match[0];
        if (m) {
            injectTag = m;
            break;
        }
    }
    if (!injectTag) {
        logs.logWarn(`Failed to inject refresh script! Couldn't find any of the tags : ${injectCandidates}, from index.html`);
        return;
    }
    const injected = ~injectTag.indexOf('script') ? (injectTag + '\n' + INJECTED_CODE) : (INJECTED_CODE + injectTag);
    replaceContent(indexPath, injectTag, injected);

}

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
                logs.logInfo(`Port ${port} is in use, trying another one...`)
                ++serverOptions.port;
                httpServer.listen(++port, host, () => {
                    r(port)
                })
            } else {
                httpServer.removeListener('error', onError)
                LiveServer.shutdown();
                reject(e)
            }
        }
        const r = (port) => {
            httpServer.removeListener('error', onError)
            resolve(port)
        }

        httpServer.on('error', onError)

        httpServer.listen(port, host, () => {
            r(port)
        })
    })
}

const openBrowser = async (url) => {
    const open = await Promise.resolve().then(() => require('open'));
    open(url, { wait: false });
}

const listenServer = ({ server, port, host, wait = 2000 }) => {
    if (!server) return;
    server.addListener('upgrade', function (request, socket, head) {
        var ws = new WebSocket(request, socket, head);

        ws.onopen = function () {
            ws.send('connected');
        };
        if (wait > 0) {
            (function () {
                var wssend = ws.send;
                var waitTimeout;
                ws.send = function () {
                    var args = arguments;
                    if (waitTimeout) clearTimeout(waitTimeout);
                    waitTimeout = setTimeout(function () {
                        wssend.apply(ws, args);
                    }, wait);
                };
            })();
        }
        ws.onclose = function () {
            LiveServer.clients = LiveServer.clients.filter(function (x) {
                return x !== ws;
            });
        };
        LiveServer.clients.push(ws);
    });
}



const runPreview = async (host, port, staticPath) => {

    runInject(staticPath);

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
    LiveServer.server = server;
    listenServer({ server });
    try {
        let serverOptions = {
            port,
            host
        };
        try {
            await httpServerStart(server, serverOptions)
        } catch (error) {
            logs.logError(error);
        }

        openBrowser(`http://${host}:${serverOptions.port}`)
        // listenServer({ server, host, port: serverOptions.port });
        runWatcher(staticPath);

        logs.green(`\nbuild preview server running at:\n`)
        const hostname = resolveHostname(serverOptions.host);
        logs.printServerUrls(hostname, 'http', serverOptions.port);
    } catch (error) {
        throw error;
    }
}

LiveServer.shutdown = () => {
    var watcher = LiveServer.watcher;
    if (watcher) {
        watcher.close();
    }
    var server = LiveServer.server;
    if (server) server.close();
};

module.exports = {
    runPreview
}