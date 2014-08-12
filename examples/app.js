"use strict";
/**
 * @file standalone example
 * @module supergiovane
 * @package supergiovane
 * @subpackage examples
 * @version 0.0.1
 * @author hex7c0 <hex7c0@gmail.com>
 * @license GPLv3
 */

/*
 * initialize module
 */
// import
try {
    var supergiovane = require('../index.min.js'); // use
    // require('supergiovane')
    // instead
} catch (MODULE_NOT_FOUND) {
    console.error(MODULE_NOT_FOUND);
    process.exit(1);
}

/*
 * use
 */
supergiovane({
    env: 'development',
    port: 3000,
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
