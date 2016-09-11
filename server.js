'use strict';
/**
 * @file heroku deploy server
 * @module supergiovane
 * @version 0.0.1
 * @author hex7c0 <hex7c0@gmail.com>
 * @license GPLv3
 */

/*
 * initialize module
 */
var supergiovane = require('.');

/*
 * use
 */
supergiovane({
  logger: false,
  timeout: false,
  sitemap: false,
  signature: {
    token: 'Minor'
  }
});
