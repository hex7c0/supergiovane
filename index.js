'use strict';
/**
 * @file supergiovane main
 * @module supergiovane
 * @package supergiovane
 * @subpackage main
 * @version 1.6.0
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
  var http = require('http');
  var resolve = require('path').resolve;
  var status = http.STATUS_CODES;
  // module
  var express = require('express');
  var logger = require('logger-request');
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
  if (my.env == 'production') {
    app.enable('view cache');
  } else {
    app.disable('view cache');
  }
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
  if (my.signature) {
    app.use(require('server-signature')(my.signature));
  }
  if (my.sitemap) {
    require('express-sitemap')(my.sitemap).toFile();
  }
  app.use(require('compression')());

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

      if (STORY[hash] === undefined) {
        var c = 0, old = Date.now(), last;
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
          time: Date.now()
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
  // http.globalAgent.maxSockets = Math.pow(my.fork, 2); // by default set to Infinity on iojs 1.0
  var httpAgent = new http.Agent({
    keepAlive: true
  });
  var STORY = Object.create(null);
  var index = resolve(my.dir + 'index.min.html');

  // routing
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
    var r = req.headers.referer || req.headers.referrer;
    var p = req.params.pkg;
    var e = req.params.extra || '';
    var s = req.query.style ? '?style=' + req.query.style : '';
    var hash = p + e + s;

    // checkpoint
    if (my.referer.test(r) === false && e !== 'badge.svg') {
      return res.redirect(301, my.referer.source);
    }
    if (my.cache !== false && STORY[hash] !== undefined) {
      res.set('Content-Type', STORY[hash].content);
      res.status(202).send(STORY[hash].body);
      // flush cache after 1 day
      if (Date.now() - STORY[hash].time > my.flush) {
        delete STORY[hash];
      }
      return;
    }
    if (e !== '') { // extra information
      if (e === 'badge.svg') {
        // pass
      } else if (semver.valid(e)) {
        version += e;
      } else {
        return next(new Error(status[404]));
      }
    }

    return http.get({
      host: 'registry.npmjs.org',
      path: '/' + p + version,
      agent: httpAgent,
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
      }).on('end', function() {

        body = JSON.parse(body);
        body.readme = null; // remove too big

        // badge
        if (e === 'badge.svg') {
          var c = Object.keys(body.versions).length;
          var plu = c > 1 ? 's-' : '-';
          http.get({
            host: 'img.shields.io',
            path: '/badge/version' + plu + c + '-red.svg' + s,
            agent: httpAgent,
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
            }).on('end', function() {

              var content = 'image/svg+xml; charset=utf-8';
              res.set('Content-Type', content);
              res.send(badge);
              cache(badge, hash, content);
              return;
            }).on('error', function(err) {

              next(new Error(status[404]));
              return debug('client', {
                pid: process.pid,
                status: 'response',
                error: err.message
              });
            });
            return;
          }).on('error', function(err) {

            next(new Error(status[404]));
            return debug('client', {
              pid: process.pid,
              status: 'response',
              error: err.message
            });
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
    }).on('error', function(err) {

      next(new Error(status[404]));
      return debug('client', {
        pid: process.pid,
        status: 'request',
        error: err.message
      });
    });
  });
  /**
   * index
   * 
   * @param {Object} req - client request
   * @param {Object} res - response to client
   */
  app.get('/', function(req, res) {

    return res.sendFile(index);
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

    var out = '';
    var error = err.message.toLowerCase(); // string
    var code = 500;
    debug('web', {
      pid: process.pid,
      status: 'catch',
      error: error
    });
    switch (error) {
      case 'not found':
        return next();
      default:
        if (my.env !== 'production') {
          out = error;
        }
        break;
    }
    res.status(code).json({
      error: out
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
    if (my.env != 'production') {
      console.log(process.pid + ' | listening on: ' + my.host + ':' + my.port);
    }
    debug('web', {
      pid: process.pid,
      host: my.host,
      port: my.port
    });
    var server = http.createServer(app);
    if (my.timeout && my.timeout.milliseconds) {
      server.timeout = my.timeout.milliseconds;
    }
    server.listen(my.port, my.host);
  }
  return app;
}

/**
 * option setting
 * 
 * @exports supergiovane
 * @function supergiovane
 * @param {Object} opt - various options. Check README.md
 * @return {Object}
 */
module.exports = function supergiovane(opt) {

  var options = opt || Object.create(null);
  var my = {
    env: String(options.env || 'production'),
    host: String(options.host || '127.0.0.1'),
    port: Number(options.port) || 3000,
    referer: new RegExp(String(options.referer || 'http://127.0.0.1'), 'i'),
    dir: String(options.dir || __dirname + '/public/'),
    logger: options.logger === false ? false : options.logger || {},
    timeout: options.timeout === false ? false : options.timeout || {},
    sitemap: options.sitemap === false ? false : options.sitemap || {},
    signature: options.signature === false ? false : options.signature || false,
    cache: options.cache === false ? false : Number(options.cache) || 6,
    flush: Number(options.flush) || 86400000,
    fork: Number(opt.fork) < 5 ? require('os').cpus().length : Number(opt.fork)
        || require('os').cpus().length,
    max: typeof opt.max === 'string' ? opt.max : Number(opt.max) || 0,
    debug: options.debug === false ? false : options.debug || 'debug.log',
    task: Boolean(options.task) ? options.task : false,
  };
  if (my.debug) {
    debug = logger({
      filename: my.debug,
      standalone: true,
      winston: {
        logger: '_spDebug',
        level: 'debug',
        json: false
      }
    });
  }

  /*
   * father
   */
  if (cluster.isMaster) {
    if (my.task) {
      require('task-manager')(my.task, {
        output: Boolean(my.debug)
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

      debug('cluster', {
        pid: worker.process.pid,
        status: code || signal,
        suicide: worker.suicide,
        max: my.max
      });
      if (worker.suicide === true) { // task-manager kill or disconnect
        cluster.fork();
      } else if (isNaN(my.max) === true || my.max-- > 0) { // bug restart, not too much
        cluster.fork();
      }
      return;
    });
    return;
  }

  /*
   * child
   */
  process.on('uncaughtException', function(err) {

    debug('cluster', {
      pid: process.pid,
      status: 'uncaughtException',
      error: err.message,
      stack: err.stack
    });
    return setTimeout(function() { // wait logger write

      return process.exit(1);
    }, 250);
  });
  return bootstrap(my);
};
