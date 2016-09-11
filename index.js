'use strict';
/**
 * @file supergiovane main
 * @module supergiovane
 * @subpackage main
 * @version 1.7.0
 * @author hex7c0 <hex7c0@gmail.com>
 * @copyright hex7c0 2014
 * @license GPLv3
 */

/*
 * initialize module
 */
var cluster = require('cluster');
var https = require('https');
var http = require('http');
var resolve = require('path').resolve;
var status = http.STATUS_CODES;
var express = require('express');
var logger = require('logger-request');
var semver = require('semver');
var setHeader = require('setheaders').setWritableHeader;
var zlib = require('zlib');
// load
var VERSION = JSON.parse(require('fs')
    .readFileSync(__dirname + '/package.json'));
VERSION = VERSION.name + '@' + VERSION.version;
var isApi = /^\/api(\/)?/i;
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
  if (my.mamma) {
    require('mamma').createClient(my.mamma, process.pid + ':supergiovane').on(
      'error', function(err) {

        debug('cluster', {
          pid: process.pid,
          status: 'mamma',
          error: err.message
        });
      });
  }
  app.use(require('compression-zlib')());

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
    };
  } else {
    cache = function() {

      return;
    };
  }

  // cfg
  // http.globalAgent.maxSockets = Math.pow(my.fork, 2); // by default set to Infinity on iojs 1.0
  var httpsAgent = new https.Agent({
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
  app.get('/api/:pkg/:extra?', function(req, res, next) {

    var isBadge = false;
    var version = '/';
    var pkg = req.params.pkg;
    var extra = req.params.extra || '';
    var s = req.query.style ? '?style=' + req.query.style : '';
    var hash = pkg + extra + s;

    // checkpoint
    if (my.cache !== false && STORY[hash]) {
      // flush cache after 1 day
      if (Date.now() - STORY[hash].time > my.flush) {
        delete STORY[hash];
      }
      return setHeader(res, 'Content-Type', STORY[hash].content) === true ? res
          .status(202).send(STORY[hash].body) : null;
    }

    if (extra !== '') { // extra information
      if (extra === 'badge.svg') { // display badge
        isBadge = true;
      } else if (semver.valid(extra)) { // single package
        version += extra;
      } else {
        return next(new Error(status[404]));
      }
    }

    https.get({
      host: 'registry.npmjs.org',
      path: '/' + pkg + version,
      agent: httpsAgent,
      headers: {
        'User-Agent': VERSION,
        'Accept-Encoding': 'gzip'
      }
    }, function(response) {

      if (response.statusCode !== 200) {
        return next(new Error(status[404]));
      }
      var body = new Buffer(0);

      response.on('data', function(chunk) {

        body = Buffer.concat([ body, chunk ]);// buffer
      }).on('end', function() {

        try {
          if (response.headers['content-encoding'] === 'gzip') {
            body = zlib.unzipSync(body);
          }
          body = JSON.parse(body);
        } catch (err) {
          return next(new Error(status[502]));
        }

        // reduce body
        body.readme = null;
        body.keywords = [];
        body.contributors = [];
        body.users = {};

        // badge
        if (isBadge === true) { // build another request
          var c = Object.keys(body.versions).length;
          var plu = c > 1 ? 's-' : '-';
          return https.get({
            host: 'img.shields.io',
            path: '/badge/version' + plu + c + '-red.svg' + s,
            agent: httpsAgent,
            headers: {
              'User-Agent': VERSION
            }
          }, function(response) {

            if (response.statusCode !== 200) {
              return next(new Error(status[404]));
            }
            var badge = new Buffer(0);

            response.on('data', function(chunk) {

              badge = Buffer.concat([ badge, chunk ]);// buffer
            }).on('end', function() {

              var content = 'image/svg+xml; charset=utf-8';
              if (setHeader(res, 'Content-Type', content) === true) {
                res.send(badge);
                cache(badge, hash, content);
              }
            }).on('error', function(err) {

              next(new Error(status[404]));
              debug('client', {
                pid: process.pid,
                status: 'response',
                error: err.message
              });
            });
          }).on('error', function(err) {

            next(new Error(status[404]));
            debug('client', {
              pid: process.pid,
              status: 'response',
              error: err.message
            });
          });
        } // EOF badge

        var content = 'application/json; charset=utf-8';
        if (setHeader(res, 'Content-Type', content) === true) {
          res.send(body);
          cache(body, hash, content);
        }
      });

    }).on('error', function(err) {

      next(new Error(status[404]));
      debug('client', {
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

    res.sendFile(index);
  });

  app.use('/static', express.static(my.dir));

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
    var error = err.message.toLowerCase(); // string

    switch (error) {
      case 'not found':
        return next();
      default:
        debug('web', {
          pid: process.pid,
          status: 'catch',
          error: error
        });
        if (my.env === 'production') {
          error = status[code].toLowerCase();
        }
        break;
    }

    var out = res.status(code);
    if (isApi.test(req.url) === true) {
      out.json({
        error: error
      });
    } else {
      out.end(error);
    }
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
    var error = status[code].toLowerCase();
    var out = res.status(code);
    if (isApi.test(req.url) === true) {
      out.json({
        error: error
      });
    } else {
      out.end(error);
    }
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
    logger: options.logger === false ? false : options.logger || {
      filename: 'route.log',
      daily: true
    },
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
    mamma: Boolean(options.mamma) ? options.mamma : false
  };
  if (my.debug) {
    debug = logger({
      filename: my.debug,
      daily: true,
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
      require('task-manager')(my.task);
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
    });
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
    setTimeout(function() { // wait logger write

      process.exit(1);
    }, 250);
  });

  return bootstrap(my);
};
