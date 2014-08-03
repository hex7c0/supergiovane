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
describe('http',function() {

    var app;
    var r = __dirname + '/r.txt';
    var s = __dirname + '/s.xml';
    before(function(done) {

        app = supergiovane({
            env: 'development',
            sitemap: {
                robots: r,
                sitemap: s
            }
        });
        done();
    });

    describe('correct - should return 200 status code',function() {

        it('index',function(done) {

            request(app).get('/').expect(200,done);
        });

        it('package',function(done) {

            request(app).get('/supergiovane/')
                    .set('Referer','http://127.0.0.1').expect(200).end(
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

        it('static',function(done) {

            request(app).get('/js/script.min.js').expect(404,done);
        });

        it('package misconfigured',function(done) {

            request(app).get('/supergiovane').expect(404,done);
        });

        it('package without refer',function(done) {

            request(app).get('/supergiovane/').expect(301,done);
        });

        it('package different refer',function(done) {

            request(app).get('/supergiovane/').set('Referer','mah').expect(301,
                    done);
        });

        it('package wrong',function(done) {

            request(app).get('/supergiovane_qwertyuiop/').expect(301,done);
        });
    });

    describe('remove files',function() {

        it('logger',function(done) {

            fs.unlink('route.log',function(err) {

                if (err)
                    throw err;
                done();
                return;
            });
        });

        it('robots',function(done) {

            fs.unlink(r,function(err) {

                if (err)
                    throw err;
                done();
                return;
            });
        });

        it('sitemap',function(done) {

            fs.unlink(s,function(err) {

                if (err)
                    throw err;
                done();
                return;
            });
        });
    });
});
