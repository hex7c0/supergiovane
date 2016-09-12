'use strict';
/**
 * @file http test
 * @module supergiovane
 * @subpackage test
 * @version 0.0.1
 * @author hex7c0 <hex7c0@gmail.com>
 * @license GPLv3
 */

/*
 * initialize module
 */
var supergiovane = require('..');
var request = require('supertest');
var assert = require('assert');
var fs = require('fs');

var pad = function(val, len) {

  var val = String(val);
  var len = len || 2;
  while (val.length < len) {
    val = '0' + val;
  }
  return val;
};

/*
 * test module
 */
describe('http', function() {

  var app;
  var r = __dirname + '/r.txt';
  var s = __dirname + '/s.xml';

  before(function(done) {

    app = supergiovane({
      env: 'test',
      sitemap: {
        robots: r,
        sitemap: s
      },
      debug: 'debug2.log'
    });
    done();
  });

  describe('200 status code', function() {

    var cache;

    it('should get index', function(done) {

      request(app).get('/').expect(200, done);
    });
    it('should get package', function(done) {

      request(app).get('/api/supergiovane/').set('Referer', 'http://127.0.0.1')
          .expect(200).end(function(err, res) {

            assert.ifError(err);
            assert.deepEqual(res.statusCode, 200);
            cache = JSON.parse(res.text);
            assert.deepEqual(cache.name, 'supergiovane');
            assert.deepEqual(cache.versions['0.0.1'].main, 'index.min.js');
            assert.deepEqual(cache.license, 'GPL-3.0');
            done();
          });
    });
    it('should get cached', function(done) {

      request(app).get('/api/supergiovane/').set('Referer', 'http://127.0.0.1')
          .expect(202).end(function(err, res) {

            assert.ifError(err);
            assert.deepEqual(cache, JSON.parse(res.text));
            done();
          });
    });
    it('should get package without refer', function(done) {

      request(app).get('/api/supergiovane/').expect(202, done);
    });
    it('should get package different refer', function(done) {

      request(app).get('/api/supergiovane/').set('Referer', 'mah').expect(202,
        done);
    });
    it('shouldn\'t get package with a wrong name', function(done) {

      request(app).get('/api/leading-space:and:weirdchars/').expect(404, done);
    });
  });

  describe('404 status code', function() {

    it('shouldn\'t get static', function(done) {

      request(app).get('/index.html').set('Referer', 'http://127.0.0.1')
          .expect(404, done);
    });
    it('shouldn\'t get wrong package', function(done) {

      request(app).get('/api/supergiovane_qwertyuiop/').set('Referer',
        'http://127.0.0.1').expect(404, done);
    });
  });

  describe('files', function() {

    var date = new Date();

    it('should remove robots', function(done) {

      fs.unlink(r, done);
    });
    it('should remove sitemap', function(done) {

      fs.unlink(s, done);
    });
    it('should remove logger', function(done) {

      var dailyF = date.getUTCFullYear() + '-' + pad(date.getUTCMonth() + 1)
        + '-' + pad(date.getUTCDate()) + '.route.log';
      fs.unlink(dailyF, done);
    });
    // it('should remove debug', function(done) {
    //
    // var dailyF = date.getUTCFullYear() + '-' + pad(date.getUTCMonth() + 1)
    // + '-' + pad(date.getUTCDate()) + '.debug2.log';
    // fs.unlink(dailyF, done);
    // });
  });
});
