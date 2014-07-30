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
} catch (MODULE_NOT_FOUND) {
    console.error(MODULE_NOT_FOUND);
    process.exit(1);
}

/*
 * test module
 */
describe('http',function() {

    var app;
    before(function(done) {

        app = supergiovane({
            env: 'development'
        });
        done();
    });

    describe('200 - should return 200 status code',function() {

        it('index',function(done) {

            request(app).get('/').expect(200,done);
        });

        it('package',function(done) {

            request(app).get('/supergiovane/').expect(200).end(
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

    describe('error - should return error',function() {

        it('static',function(done) {

            request(app).get('/js/script.min.js').expect(404,done);
        });

        it('package misconfigured',function(done) {

            request(app).get('/supergiovane').expect(404,done);
        });

        it('package wrong',function(done) {

            request(app).get('/supergiovane_qwertyuiop/').expect(404,done);
        });

    });
});
