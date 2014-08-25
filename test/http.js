"use strict";
/**
 * @file http test
 * @module supergiovane
 * @package supergiovane
 * @subpackage test
 * @version 0.0.1
 * @author hex7c0 <hex7c0@gmail.com>
 * @license GPLv3
 */

/*
 * initialize module
 */
// import
try {
    var supergiovane = require('../index.min.js'); // require('supergiovane')
    var request = require('supertest');
    var assert = require('assert');
    var fs = require('fs');
} catch (MODULE_NOT_FOUND) {
    console.error(MODULE_NOT_FOUND);
    process.exit(1);
}

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

    describe('correct - should return 200 status code', function() {

        it('index', function(done) {

            request(app).get('/').expect(200, done);
        });

        var cache;
        it('package', function(done) {

            request(app).get('/supergiovane/').set('Referer', 'http://127.0.0.1').expect(
                    200).end(function(err, res) {

                if (err)
                    throw err;
                assert.deepEqual(res.statusCode, 200);
                cache = JSON.parse(res.text);
                assert.deepEqual(cache.name, 'supergiovane');
                assert.deepEqual(cache.versions['0.0.1'].main, 'index.min.js');
                assert.deepEqual(cache.license, 'GPLv3');
                done();
            });
        });

        it('cached', function(done) {

            request(app).get('/supergiovane/').set('Referer', 'http://127.0.0.1').expect(
                    202).end(function(err, res) {

                if (err)
                    throw err;
                var j = JSON.parse(res.text);
                assert.deepEqual(cache, j);
                done();
            });
        });

        it('package without refer', function(done) {

            request(app).get('/supergiovane/').expect(301, done);
        });

        it('package different refer', function(done) {

            request(app).get('/supergiovane/').set('Referer', 'mah').expect(301, done);
        });
    });

    describe('error - should return 404 status code', function() {

        it('static', function(done) {

            request(app).get('/index.html').set('Referer', 'http://127.0.0.1').expect(
                    404, done);
        });

        // it('package misconfigured', function(done) {
        //
        // request(app).get('/supergiovane').set('Referer',
        // 'http://127.0.0.1').expect(
        // 404, done);
        // });

        it('package wrong', function(done) {

            request(app).get('/supergiovane_qwertyuiop/').set('Referer',
                    'http://127.0.0.1').expect(404, done);
        });
    });

    describe('exist files', function() {

        it('logger', function(done) {

            fs.unlink('route.log', function(err) {

                if (err)
                    throw err;
                done();
                return;
            });
        });

        it('robots', function(done) {

            fs.unlink(r, function(err) {

                if (err)
                    throw err;
                done();
                return;
            });
        });

        it('sitemap', function(done) {

            fs.unlink(s, function(err) {

                if (err)
                    throw err;
                done();
                return;
            });
        });

        it('debug', function(done) {

            fs.unlink('debug2.log', function(err) {

                if (err)
                    throw err;
                done();
                return;
            });
        });
    });
});
