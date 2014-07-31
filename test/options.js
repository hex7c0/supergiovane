"use strict";
/**
 * @file options test
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
    var supergiovane = require('../index.min.js'); // use require('supergiovane')
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
describe('options',function() {

    var app;
    var r = __dirname + '/r.txt';
    var s = __dirname + '/s.xml';
    before(function(done) {

        app = supergiovane({
            port: 3001,
            env: 'development',
            dir: __dirname + '/',
            referer: 'boh',
            logger: false,
            sitemap: false
        });
        done();
    });

    describe('correct - should return 200 status code',function() {

        it('custom index',function(done) {

            request(app).get('/').expect(200,done);
        });

        it('package',function(done) {

            request(app).get('/supergiovane/').set('Referer','boh').expect(200)
                    .end(
                            function(err,res) {

                                if (err)
                                    throw err;
                                assert.deepEqual(res.statusCode,200);
                                var j = JSON.parse(res.text);
                                assert.deepEqual(j.name,'supergiovane');
                                assert.deepEqual(j.versions['0.0.1'].main,
                                        'index.min.js');
                                assert.deepEqual(j.license,'GPLv3');
                                done();
                            });
        });
    });

    describe('error - should return 404 status code',function() {

        it('package different refer',function(done) {

            request(app).get('/supergiovane/').set('Referer','mah').expect(404,
                    done);
        });
    });

    describe('exists files',function() {

        it('logger',function(done) {

            if (!fs.existsSync('route.log')) {
                done();
            }
            return;
        });

        it('robots',function(done) {

            if (!fs.existsSync(r)) {
                done();
            }
            return;
        });

        it('sitemap',function(done) {

            if (!fs.existsSync(s)) {
                done();
            }
            return;
        });
    });
});
