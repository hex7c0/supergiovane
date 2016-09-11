'use strict';
/**
 * @file standalone example
 * @module supergiovane
 * @subpackage examples
 * @version 0.0.1
 * @author hex7c0 <hex7c0@gmail.com>
 * @license GPLv3
 */

/*
 * initialize module
 */
var supergiovane = require('..'); // use require('supergiovane') instead

/*
 * use
 */
supergiovane({
  env: 'development',
  port: 3000,
  timeout: {
    milliseconds: 30000
  },
  sitemap: {
    route: {
      'ALL': {
        disallow: true,
      }
    }
  },
  signature: {
    token: 'Minor'
  }
});
