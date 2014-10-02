"use strict";
/**
 * @file supergiovane main
 * @module supergiovane
 * @package supergiovane
 * @subpackage main
 * @version 1.5.0
 * @author hex7c0 <hex7c0@gmail.com>
 * @copyright hex7c0 2014
 * @license GPLv3
 */

/*
 * initialize module
 */
// import
try {
    // node
    var cluster = require('cluster');
    var cpu = require('os').cpus().length * 2;
    var http = require('http');
    var resolve = require('path').resolve;
    var status = http.STATUS_CODES;
    // module
    var compression = require('compression');
    var express = require('express');
    var logger = require('logger-request');
    var lusca = require('lusca');
    var semver = require('semver');
} catch (MODULE_NOT_FOUND) {
    console.error(MODULE_NOT_FOUND);
    process.exit(1);
}
// load
var VERSION = JSON.parse(require('fs')
        .readFileSync(__dirname + '/package.json'));
VERSION = VERSION.name + '@' + VERSION.version;
var debug = function() {

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
    app.enable('trust proxy');
    app.disable('x-powered-by');

    // middleware
    if (my.logger) {
        app.use(logger(my.logger));
    }
    if (my.timeout) {
        app.use(require('timeout-request')(my.timeout));
    }
    app.use(lusca({
        xframe: 'SAMEORIGIN',
        xssProtection: true
    }));
    app.use(compression());
    if (my.signature) {
        app.use(require('server-signature')(my.signature));
    }
    if (my.sitemap) {
        require('express-sitemap')(my.sitemap).toFile();
    }
    var cache;
    if (my.cache) {
        /**
         * save cache
         * 
         * @function caches
         * @param {String} bod - output body
         * @param {String} hash - hash
         * @param {String} cont - set content
         * @return {Object}
         */
        cache = function(bod, hash, cont) {

            if (!STORY[hash]) {
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
                STORY[hash] = {
                    content: cont,
                    body: bod,
                    time: new Date().getTime()
                };
            }
            return;
        };
    } else {
        cache = function() {

            return;
        };
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
     * @param {next} next - next callback
     */
    app.get('/:pkg/:extra?', function(req, res, next) {

        var version = '/';
        var r = req.headers['referer'] || req.headers['referrer'];
        var p = req.params.pkg;
        var e = req.params.extra || '';
        var s = req.query.style ? '?style=' + req.query.style : '';
        var hash = p + e + s;

        // checkpoint
        if (!my.referer.test(r) && e !== 'badge.svg') {
            return res.redirect(301, my.referer.source);
        }
        if (my.cache && STORY[hash]) {
            res.set('Content-Type', STORY[hash].content);
            res.status(202).send(STORY[hash].body);
            // flush cache after 1 day
            if (new Date().getTime() - STORY[hash].time > my.flush) {
                delete STORY[hash];
            }
            return;
        }
        if (e) { // extra information
            if (e === 'badge.svg') {
                // pass
            } else if (semver.valid(e)) {
                version += e;
            } else {
                return next(new Error(status[404]));
            }
        }

        http.get({
            host: 'registry.npmjs.org',
            path: '/' + p + version,
            headers: {
                'User-Agent': VERSION
            }
        }, function(inp) {

            var body = new Buffer(0);
            if (inp.statusCode !== 200) {
                return next(new Error(status[404]));
            }
            inp.on('data', function(chunk) {

                body += chunk; // buffer
                return;
            });
            inp.on('end', function() {

                body = JSON.parse(body);
                body.readme = null; // remove too big

                // badge
                if (e === 'badge.svg') {
                    var c = 0;
                    for ( var i in body.versions) {
                        c++;
                    }
                    var plu = c > 1 ? 's-' : '-';
                    http.get({
                        host: 'img.shields.io',
                        path: '/badge/version' + plu + c + '-red.svg' + s,
                        agent: false,
                        headers: {
                            'User-Agent': VERSION
                        }
                    }, function(inp) {

                        var badge = new Buffer(0);
                        if (inp.statusCode !== 200) {
                            return next(new Error(status[404]));
                        }
                        inp.on('data', function(chunk) {

                            badge += chunk; // buffer
                            return;
                        });
                        inp.on('end', function() {

                            var content = 'image/svg+xml; charset=utf-8';
                            res.set('Content-Type', content);
                            res.send(badge);
                            cache(badge, hash, content);
                            return;
                        });
                        return;
                    }).on('error', function(e) {

                        return next(new Error(status[404]));
                    });

                } else {
                    var content = 'application/json; charset=utf-8';
                    res.set('Content-Type', content);
                    res.send(body);
                    cache(body, hash, content);
                }
                return;
            });
            return;
        }).on('error', function(e) {

            return next(new Error(status[404]));
        });
        return;
    });
    /**
     * catch all errors returned from page
     * 
     * @function
     * @param {Object} err - error raised
     * @param {Object} req - client request
     * @param {Object} res - response to client
     * @param {next} next - next callback
     */
    app.use(function(err, req, res, next) {

        var code = 500;
        var out = '';
        debug('web', {
            pid: process.pid,
            error: err.message
        });
        switch (err.message.toLowerCase()) {
            case 'not found':
                return next();
            default:
                if (my.env !== 'production') {
                    out = err.message.toLowerCase();
                }
                break;
        }
        res.status(code).json({
            error: out || status[code].toLowerCase()
        });
        return;
    });
    /**
     * catch error 404 or if nobody cannot parse the request
     * 
     * @function
     * @param {Object} req - client request
     * @param {Object} res - response to client
     */
    app.use(function(req, res) {

        var code = 404;
        res.status(code).json({
            error: status[code].toLowerCase()
        });
        return;
    });

    if (my.env != 'test') {
        console
                .log(process.pid + ' | listening on: ' + my.host + ':'
                        + my.port);
        debug('start', {
            pid: process.pid,
            host: my.host,
            port: my.port
        });
        http.createServer(app).listen(my.port, my.host);
    }
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
        signature: options.signature == false ? false
                : options.signature || false,
        cache: options.cache == false ? false : Number(options.cache) || 6,
        flush: Number(options.flush) || 86400000,
        fork: Number(options.fork) || cpu,
        max: Number(options.max) || 0,
        debug: options.debug == false ? false : options.debug || 'debug.log',
        task: Boolean(options.task) ? options.task : false,
    };
    if (my.debug) {
        debug = logger({
            filename: my.debug,
            standalone: true,
            winston: {
                logger: '_spDebug',
                level: 'debug'
            }
        });
    }

    if (cluster.isMaster) { // father
        debug('options', my);
        if (my.task) {
            require('task-manager')(my.task, {
                output: my.debug
            });
        }

        // no cluster
        if (my.env != 'production') {
            return bootstrap(my);
        }

        // cluster
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

            // console.error(worker.process.pid + ' died by ' + signal);
            debug('restart', {
                pid: worker.process.pid,
                status: signal,
                code: code,
                max: my.max
            });
            if (my.max === NaN || my.max-- > 0) {
                cluster.fork();
            }
            return;
        });

        return;
    }

    // child
    return bootstrap(my);
};
