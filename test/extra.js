'use strict';
/**
 * @file extra test
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
var unlink = require('fs').unlink;
var request = require('supertest');
var assert = require('assert');

/*
 * test module
 */
describe('extra', function() {

  var app;
  var cache1;
  var cache2;

  before(function(done) {

    app = supergiovane({
      env: 'test',
      debug: false,
      sitemap: false,
      cache: 2,
      task: 'test.sock'
    });
    done();
  });

  describe('wrong version', function() {

    it('should return 404 for missing version', function(done) {

      request(app).get('/supergiovane/0.0.2')
          .set('Referer', 'http://127.0.0.1').expect(404, done);
    });
    it('should return 404 for misconfigurated version', function(done) {

      request(app).get('/supergiovane/0.ciao.0').set('Referer',
        'http://127.0.0.1').expect(404, done);
    });
  });

  describe('first attempt normal', function() {

    it('should return badge', function(done) {

      request(app).get('/supergiovane/badge.svg').expect(200).expect(
        'Content-Type', 'image/svg+xml; charset=utf-8').end(
        function(err, res) {

          assert.ifError(err);
          assert.ok(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/
              .test(res.body));
          cache1 = res.body;
          done();
        });
    });
    it('should return specific version', function(done) {

      request(app).get('/supergiovane/1.0.0')
          .set('Referer', 'http://127.0.0.1').expect(200).expect(
            'Content-Type', 'application/json; charset=utf-8').end(
            function(err, res) {

              assert.ifError(err);
              cache2 = JSON.parse(res.text);
              assert.deepEqual(cache2.version, '1.0.0', 'version');
              assert.deepEqual(cache2.dist.shasum,
                '9bdc48303b50f2c7b2b28102f45f25dc3c2307ce', 'sha');
              done();
            });
    });
  });

  describe('second attempt normal', function() {

    it('should return badge', function(done) {

      request(app).get('/supergiovane/badge.svg').expect(202).expect(
        'Content-Type', 'image/svg+xml; charset=utf-8').end(
        function(err, res) {

          assert.ifError(err);
          assert.ok(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/
              .test(res.body));
          assert.deepEqual(cache1, res.body);
          assert.notDeepEqual(cache2, res.body);
          done();
        });
    });
    it('should return specific version', function(done) {

      request(app).get('/supergiovane/1.0.0')
          .set('Referer', 'http://127.0.0.1').expect(202).expect(
            'Content-Type', 'application/json; charset=utf-8').end(
            function(err, res) {

              assert.ifError(err);
              assert.deepEqual(cache2, JSON.parse(res.text));
              assert.notDeepEqual(cache1, cache2);
              done();
            });
    });
  });

  describe('files', function() {

    it('should remove domain socket', function(done) {

      unlink('test.sock', done);
    });
  });
});
