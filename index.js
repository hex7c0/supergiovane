"use strict";
/**
 * @file supergiovane main
 * @module supergiovane
 * @package supergiovane
 * @subpackage main
 * @version 1.2.1
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
    var express = require('express');
    var sitemap = require('express-sitemap');
    var http = require('http');
    var logger = require('logger-request');
    var lusca = require('lusca');
    var vhost = require('top-vhost');
    var timeout = require('timeout-request');
    var cpu = require('os').cpus().length * 2;
} catch (MODULE_NOT_FOUND) {
    console.error(MODULE_NOT_FOUND);
    process.exit(1);
}
// load
var VERSION = '1.2.1';
var ERROR = 'matusa';

/*
 * functions
 */
/**
 * starting point
 * 
 * @param {Object} my - user cfg
 * @return {Object}
 */
function bootstrap(my) {

    // setting
    var app = express();
    app.set('env',my.env);
    my.env == 'production' ? app.enable('view cache') : app
            .disable('view cache');
    app.enable('case sensitive routing');
    app.enable('strict routing');
    app.enable('trust proxy');
    app.disable('x-powered-by');
    app.disable('etag');
    // middleware
    if (my.logger) {
        app.use(logger(my.logger));
    }
    if (my.timeout) {
        app.use(timeout(my.timeout));
    }
    if (my.vhost) {
        app.use(vhost(my.vhost));
    }
    app.use(lusca({
        xframe: 'SAMEORIGIN',
        xssProtection: true
    }));
    app.use(compression({
        level: 9,
        threshold: 256
    }));
    if (my.sitemap) {
        sitemap(my.sitemap).toFile();
    }
    // cfg
    http.globalAgent.maxSockets = Math.pow(cpu,2);
    http.timeout = 60000;
    // routing
    /**
     * index
     * 
     * @param {Object} req - client request
     * @param {Object} res - response to client
     * @param {next} next - continue routes
     */
    app.get('/',function(req,res) {

        res.sendfile(my.dir + 'index.min.html');
        return;
    });

    /**
     * http request (no client ajax due browser securty limitation)
     * 
     * @function
     * @param {Object} req - client request
     * @param {Object} res - response to client
     * @param {next} next - continue routes
     */
    app.get('/:pkg/',function(req,res) {

        var p = req.params.pkg;
        var r = req.headers['referer'] || req.headers['referrer'];
        if (typeof p === 'string' && my.referer.test(r)) {
            var out = http.request({
                host: 'registry.npmjs.org',
                port: 80,
                path: '/' + p,
                method: 'GET',
                // agent: false
                headers: {
                    'User-Agent': 'supergiovane@' + VERSION
                }
            },function(inp) {

                // var body='';
                var body = new Buffer(0);
                if (inp.statusCode == 200 || inp.statusCode == 304) {
                    // inp.setEncoding('utf8');
                    inp.on('data',function(chunk) {

                        // buffer
                        body += chunk;
                        return;
                    });
                    inp.on('end',function() {

                        body = body.toString();
                        // remove too big
                        body.readme = null;
                        res.end(body);
                    });
                } else {
                    res.status(404).end(ERROR);
                }
                return;
            });
            out.on('error',function(e) {

                res.status(404).end(ERROR);
                return;
            });
            out.end();
        } else {
            res.redirect(301,my.referer.source);
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
    app.use(function(err,req,res,next) {

        var code = 0;
        switch (err.message.toLowerCase()){
            case 'not found':
                next();
            break;
            case 'unauthorized':
                code = 401;
            break;
            case 'forbidden':
                code = 403;
            break;
            case 'bad gateway':
                code = 502;
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
    app.use(function(req,res,next) {

        var code = 404;
        res.status(code).end(ERROR);
        return;
    });

    console.log(process.pid + ' | listening on: ' + my.host + ':' + my.port);
    http.createServer(app).listen(my.port,my.host);
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
        referer: new RegExp(String(options.referer || 'http://127.0.0.1'),'i'),
        dir: String(options.dir || __dirname + '/public/'),
        logger: options.logger == false ? false : options.logger
                || Object.create(null),
        timeout: options.timeout == false ? false : options.timeout
                || Object.create(null),
        sitemap: options.sitemap == false ? false : options.sitemap
                || Object.create(null),
        vhost: options.vhost == false ? false : options.vhost || false
    };

    if (my.env == 'development') { // no cluster
        return bootstrap(my);
    }
    if (cluster.isMaster) { // father

        for (var i = 0; i < cpu; i++) {
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
        cluster.on('exit',function(worker,code,signal) {

            console.warn(worker.process.pid + ' died by ' + signal);
            return;
        });
    } else { // child

        return bootstrap(my);
    }
    return;
};
