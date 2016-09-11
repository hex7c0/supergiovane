'use strict';
/**
 * @file options test
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
describe('options', function() {

  var app;
  var r = __dirname + '/r.txt';
  var s = __dirname + '/s.xml';

  before(function(done) {

    app = supergiovane({
      port: 3001,
      env: 'test',
      dir: __dirname + '/',
      referer: 'boh',
      logger: false,
      sitemap: false,
      signature: {
        token: 'Full'
      },
      debug: false
    });
    done();
  });

  describe('200 status code', function() {

    it('should get index', function(done) {

      request(app).get('/').expect(200, done);
    });
    it('should get package', function(done) {

      request(app).get('/api/supergiovane/').expect('Server',
        /Nodejs\/[0-9]{1,2}.[0-9]{1,2}.[0-9]{1,2} \(/).set('Referer', 'boh')
          .expect(200).end(function(err, res) {

            assert.ifError(err);
            assert.deepEqual(res.statusCode, 200);
            var j = JSON.parse(res.text);
            assert.deepEqual(j.name, 'supergiovane');
            assert.deepEqual(j.versions['0.0.1'].main, 'index.min.js');
            assert.deepEqual(j.license, 'GPL-3.0');
            done();
          });
    });
  });

  describe('301 status code', function() {

    it('should get package, because different refer', function(done) {

      request(app).get('/api/supergiovane/').set('Referer', 'mah').expect(202,
        done);
    });
  });

  describe('files', function() {

    it('shouldn\'t exist logger', function(done) {

      assert.equal(fs.existsSync('route.log'), false);
      done();
    });
    it('shouldn\'t exist robots', function(done) {

      assert.equal(fs.existsSync(r), false);
      done();
    });
    it('shouldn\'t exist sitemap', function(done) {

      assert.equal(fs.existsSync(s), false);
      done();
    });
    // it('shouldn\'t exist debug', function(done) {
    //
    // assert.equal(fs.existsSync('debug.log'), false);
    // done();
    // });
  });
});
