"use strict";
/**
 * @file supergiovane main
 * @module supergiovane
 * @package supergiovane
 * @subpackage main
 * @version 1.0.0
 * @author hex7c0 <hex7c0@gmail.com>
 * @copyright hex7c0 2014
 * @license GPLv3
 */

/*
 * initialize module
 */
var VERSION = '1.0.0';
// import
try {
    var cluster = require('cluster');
    var cpu = require('os').cpus().length;
    var compression = require('compression');
    var app = require('express')();
    var sitemap = require('express-sitemap');
    var http = require('http');
    var logger = require('logger-request');
    var timeout = require('timeout-request');
} catch (MODULE_NOT_FOUND) {
    console.error(MODULE_NOT_FOUND);
    process.exit(1);
}

/*
 * functions
 */
/**
 * option setting
 * 
 * @exports supergiovane
 * @function supergiovane
 * @param {Object} options - various options. Check README.md
 * @return {Function}
 */
module.exports = function supergiovane(options) {

    var options = options || Object.create(null);
    var my = {
        env: String(env || 'production'),
        port: Number(options.port) || 3000,
        dir: String(options.dir || __dirname + '/public/'),
        logger: logger || Object.create(null),
        timeout: timeout || Object.create(null),
        compression: compression || Object.create(null)
    };

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
         * @return
         */
        CLUSTER.on('exit',function(worker,code,signal) {

            console.warn(worker.process.pid + ' died by ' + signal);
            return;
        });
    } else { // child

        // setting
        app.set('env',my.env);
        my.env == 'production' ? app.enable('view cache') : app
                .disable('view cache');
        app.enable('case sensitive routing');
        app.enable('strict routing');
        app.enable('trust proxy');
        app.disable('x-powered-by');
        app.disable('etag');
        app.use(logger(my.logger));
        app.use(timeout(my.timeout));
        app.use(compression(my.compression));

        /**
         * index
         * 
         * @function
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

            var out = http.request({
                host: 'registry.npmjs.org',
                port: 80,
                path: '/' + req.params.pkg,
                method: 'GET',
                headers: {
                    'User-Agent': 'supergiovane-' + VERSION,
                },
                agent: false
            },function(inp) {

                var body = '';
                if (inp.statusCode == 200 || inp.statusCode == 304) {
                    inp.setEncoding('utf8');
                    inp.on('data',function(chunk) {

                        body += chunk;
                        return;
                    });
                    inp.on('end',function() {

                        // remove too big
                        body.readme = null;
                        res.end(body);
                    });
                } else {
                    res.status(404).end();
                }
                return;
            });
            req.on('error',function(e) {

                res.status(404).end();
                return;
            });
            out.end();
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
            res.status(code).end();
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
            res.status(code).end();
            return;
        });

        console.log(process.pid + ' | listening on port: ' + my.port);
        http.createServer(app).listen(my.port);
        return;
    }
};
