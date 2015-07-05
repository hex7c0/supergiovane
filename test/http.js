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

      request(app).get('/supergiovane/').set('Referer', 'http://127.0.0.1')
      .expect(200).end(function(err, res) {

        assert.equal(err, null);
        assert.deepEqual(res.statusCode, 200);
        cache = JSON.parse(res.text);
        assert.deepEqual(cache.name, 'supergiovane');
        assert.deepEqual(cache.versions['0.0.1'].main, 'index.min.js');
        assert.deepEqual(cache.license, 'GPL-3.0');
        done();
      });
    });
    it('should get cached', function(done) {

      request(app).get('/supergiovane/').set('Referer', 'http://127.0.0.1')
      .expect(202).end(function(err, res) {

        if (err) throw err;
        var j = JSON.parse(res.text);
        assert.deepEqual(cache, j);
        done();
      });
    });
    it('shouldn\'t get package without refer', function(done) {

      request(app).get('/supergiovane/').expect(301, done);
    });
    it('shouldn\'t get package different refer', function(done) {

      request(app).get('/supergiovane/').set('Referer', 'mah')
      .expect(301, done);
    });
  });

  describe('404 status code', function() {

    it('shouldn\'t get static', function(done) {

      request(app).get('/index.html').set('Referer', 'http://127.0.0.1')
      .expect(404, done);
    });
    it('shouldn\'t get wrong package', function(done) {

      request(app).get('/supergiovane_qwertyuiop/').set('Referer',
        'http://127.0.0.1').expect(404, done);
    });
  });

  describe('files', function() {

    it('should remove logger', function(done) {

      fs.unlink('route.log', done);
    });
    it('should remove robots', function(done) {

      fs.unlink(r, done);
    });
    it('should remove sitemap', function(done) {

      fs.unlink(s, done);
    });
    it('should remove debug', function(done) {

      fs.unlink('debug2.log', done);
    });
  });
});
