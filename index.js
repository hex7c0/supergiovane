"use strict";
/**
 * @file supergiovane main
 * @module supergiovane
 * @package supergiovane
 * @subpackage main
 * @version 1.3.1
 * @author hex7c0 <hex7c0@gmail.com>
 * @copyright hex7c0 2014
 * @license GPLv3
 */

/*
 * initialize module
 */
// import
try {
    var cluster = require('cluster');
    var compression = require('compression');
    var cookie = require('cookie-parser');
    var csurf = require('csurf');
    var express = require('express');
    var http = require('http');
    var lusca = require('lusca');
    var logger = require('logger-request');
    var resolve = require('path').resolve;
    var cpu = require('os').cpus().length * 2;
} catch (MODULE_NOT_FOUND) {
    console.error(MODULE_NOT_FOUND);
    process.exit(1);
}
// load
var VERSION = '1.3.1';
var ERROR = 'matusa';
var DEBUG = function() {

    return;
};

/*
 * functions
 */
/**
 * starting point
 * 
 * @function bootstrap
 * @param {Object} my - user cfg
 * @return {Object}
 */
function bootstrap(my) {

    // setting
    var app = express();
    app.set('env', my.env);
    my.env == 'production' ? app.enable('view cache') : app
            .disable('view cache');
    app.enable('case sensitive routing');
    app.enable('strict routing');
    app.enable('trust proxy');
    app.disable('x-powered-by');
    // middleware
    app.use(cookie());
    if (my.logger) {
        app.use(logger(my.logger));
    }
    if (my.vhost) {
        var vhost = require('top-vhost');
        app.use(vhost(my.vhost));
    }
    if (my.timeout) {
        var timeout = require('timeout-request');
        app.use(timeout(my.timeout));
    }
    app.use(csurf({
        cookie: {
            key: 'token',
            httpOnly: true
        }
    }));
    app.use(lusca({
        xframe: 'SAMEORIGIN',
        xssProtection: true
    }));
    app.use(compression({
        level: 9,
        threshold: 256
    }));
    if (my.signature) {
        var signature = require('server-signature');
        app.use(signature(my.signature));
    }
    if (my.sitemap) {
        var sitemap = require('express-sitemap');
        sitemap(my.sitemap).toFile();
    }
    // cfg
    http.globalAgent.maxSockets = Math.pow(my.fork, 2);
    http.timeout = 60000;
    var STORY = Object.create(null);
    var index = resolve(my.dir + 'index.min.html');
    // routing
    /**
     * index
     * 
     * @param {Object} req - client request
     * @param {Object} res - response to client
     * @param {next} next - continue routes
     */
    app.get('/', function(req, res) {

        res.sendFile(index);
        return;
    });
    /**
     * http request (no client ajax due browser security limitation)
     * 
     * @function
     * @param {Object} req - client request
     * @param {Object} res - response to client
     * @param {next} next - continue routes
     */
    app.get('/:pkg/', function(req, res) {

        var p = decodeURIComponent(req.params.pkg);
        var r = req.headers['referer'] || req.headers['referrer'];
        if (typeof p === 'string' && my.referer.test(r)) {
            if (my.cache && STORY[p]) {
                res.status(202).send(STORY[p].body);
                STORY[p].time = new Date().getTime();
                return;
            }
            var out = http.request({
                host: 'registry.npmjs.org',
                port: 80,
                path: '/' + p,
                method: 'GET',
                // agent: false
                headers: {
                    'User-Agent': 'supergiovane@' + VERSION
                }
            }, function(inp) {

                var body = new Buffer(0);
                if (inp.statusCode === 200 || inp.statusCode === 304) {
                    inp.on('data', function(chunk) {

                        body += chunk; // buffer
                        return;
                    });
                    inp.on('end', function() {

                        body = JSON.parse(body);
                        body.readme = null; // remove too big
                        res.send(body);
                        if (my.cache) { // clean cache
                            var c = 0, old = new Date().getTime(), last;
                            for ( var pr in STORY) {
                                c++;
                                if (STORY[pr].time < old) {
                                    last = pr;
                                    old = STORY[last].time;
                                }
                            }
                            if (c >= my.cache) {
                                delete STORY[last];
                            }
                            STORY[p] = {
                                body: body,
                                time: new Date().getTime()
                            };
                        }
                        return;
                    });
                } else {
                    res.status(404).end(ERROR);
                }
                return;
            });
            out.on('error', function(e) {

                res.status(404).end(ERROR);
                return;
            });
            out.end();
        } else {
            res.redirect(301, my.referer.source);
        }
        return;
    });
    /**
     * catch all errors returned from page
     * 
     * @function
     * @param {Object} err - error raised
     * @param {Object} req - client request
     * @param {Object} res - response to client
     * @param {next} next - continue routes
     */
    app.use(function(err, req, res, next) {

        var code = 0;
        DEBUG('error', {
            pid: process.pid,
            error: err
        });
        switch (err.message.toLowerCase()) {
            case 'not found':
                next();
                break;
            case 'unauthorized':
                code = 401;
                break;
            case 'forbidden':
                code = 403;
                break;
            default:
                code = 500;
                break;
        }
        res.status(code).end(ERROR);
        return;
    });
    /**
     * catch error 404 or if nobody cannot parse the request
     * 
     * @function
     * @param {Object} req - client request
     * @param {Object} res - response to client
     * @param {next} next - continue routes
     */
    app.use(function(req, res, next) {

        var code = 404;
        res.status(code).end(ERROR);
        return;
    });

    console.log(process.pid + ' | listening on: ' + my.host + ':' + my.port);
    DEBUG('start', {
        pid: process.pid,
        host: my.host,
        port: my.port
    });
    http.createServer(app).listen(my.port, my.host);
    return app;
}

/**
 * option setting
 * 
 * @exports supergiovane
 * @function supergiovane
 * @param {Object} options - various options. Check README.md
 * @return {Object}
 */
module.exports = function supergiovane(options) {

    var options = options || Object.create(null);
    var my = {
        env: String(options.env || 'production'),
        host: String(options.host || '127.0.0.1'),
        port: Number(options.port) || 3000,
        referer: new RegExp(String(options.referer || 'http://127.0.0.1'), 'i'),
        dir: String(options.dir || __dirname + '/public/'),
        logger: options.logger == false ? false : options.logger
                || Object.create(null),
        timeout: options.timeout == false ? false : options.timeout
                || Object.create(null),
        sitemap: options.sitemap == false ? false : options.sitemap
                || Object.create(null),
        vhost: options.vhost == false ? false : options.vhost || false,
        signature: options.signature == false ? false
                : options.signature || false,
        cache: options.vhost == false ? false : Number(options.cache || 5),
        fork: Number(options.fork || cpu),
        max: Number(options.max || 0),
        debug: options.debug == false ? false : options.debug || 'debug.log'
    };
    if (my.debug) {
        DEBUG = logger({
            filename: my.debug,
            standalone: true,
            winston: {
                logger: '_spDebug',
                level: 'debug'
            }
        });
    }

    // cluster
    if (my.env == 'development') { // no cluster
        DEBUG('options', my);
        return bootstrap(my);
    }
    if (cluster.isMaster) { // father
        DEBUG('options', my);
        for (var i = 0; i < my.fork; i++) {
            cluster.fork();
        }
        /**
         * work if child die
         * 
         * @function
         * @param {Object} worker - worker child
         * @param {Integer} code - error code
         * @param {String} signal - error signal
         */
        cluster.on('exit', function(worker, code, signal) {

            console.error(worker.process.pid + ' died by ' + signal);
            DEBUG('restart', {
                max: my.max,
                code: code,
                signal: signal
            });
            if (my.max === NaN || my.max-- > 0) {
                cluster.fork();
            }
            return;
        });
    } else { // child
        return bootstrap(my);
    }
    return;
};
