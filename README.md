# [supergiovane](https://supergiovane.herokuapp.com/#/supergiovane)

[![NPM version](https://img.shields.io/npm/v/supergiovane.svg)](https://www.npmjs.com/package/supergiovane)
[![Linux Status](https://img.shields.io/travis/hex7c0/supergiovane.svg?label=linux)](https://travis-ci.org/hex7c0/supergiovane)
[![Dependency Status](https://img.shields.io/david/hex7c0/supergiovane.svg)](https://david-dm.org/hex7c0/supergiovane)
[![Coveralls](https://img.shields.io/coveralls/hex7c0/supergiovane.svg)](https://coveralls.io/r/hex7c0/supergiovane)

[![supergiovane logo](https://raw.githubusercontent.com/hex7c0/supergiovane/master/public/img/sp.jpg)](https://supergiovane.herokuapp.com)

website for searching through history of npm modules

Build badge with all versions found (using https://github.com/badges/shields) [![versions](https://supergiovane.herokuapp.com/supergiovane/badge.svg)](https://supergiovane.herokuapp.com/#/supergiovane)
Write with [Bootstrap](https://getbootstrap.com/) & [Angular](https://angularjs.org/). And of course [node](https://nodejs.org/)

## Installation

Install through NPM

```bash
npm install supergiovane
```
or
```bash
git clone git://github.com/hex7c0/supergiovane.git
```

## API

```js
var supergiovane = require('supergiovane');

supergiovane(options);
```

### supergiovane(options)

#### options

 - `env` - **String** Selected environment (development, production, test) *(default "production")*
 - `host` - **String** Which host accept connection from web *(default "127.0.0.1")*
 - `port` - **Integer** Which port accept connection from web *(default "3000")*
 - `referer` - **String** Which referer send data *(default "http://127.0.0.1")*
 - `dir` - **String** Absolute path of web files directory *(default "/public")*
 - `logger` - **Object | false** Configuration for [`logger-request`](https://github.com/hex7c0/logger-request) or disable *(default "standard")*
 - `timeout` - **Object | false** Configuration for [`timeout-request`](https://github.com/hex7c0/timeout-request) or disable *(default "standard")*
 - `sitemap` - **Object | false** Configuration for [`express-sitemap`](https://github.com/hex7c0/express-sitemap) or disable *(default "standard")*
 - `vhost` - **Object | false** Configuration for [`top-vhost`](https://github.com/hex7c0/top-vhost) or disable *(default "disabled")*
 - `signature` - **Object | false** Configuration for [`server-signature`](https://github.com/hex7c0/server-signature) or disable *(default "disabled")*
 - `cache` - **Number | false** Flag for store last "Number" results in cache *(default "6")*
 - `flush` - **Number** Flush cache (if enabled) after milliseconds *(default "86400000")*
 - `fork` - **Number** Number of forks (see cluster module), for single thread use "development" `env` *(default "cpus")*
 - `max` - **Number | String** Restart max number of crashed forks (use String for unlimited restart) *(default "no restart")*
 - `debug` - **String | false** Write debug information to file or disable *(default "debug.log")*
 - `task` - **Number | String | false** Related to [`task-manager`](https://github.com/hex7c0/task-manager) *(default "false")*
 - `mamma` - **Number | String | false** Related to [`mamma`](https://github.com/hex7c0/mamma) `createClient` *(default "false")*

## Examples

Take a look at my [examples](https://github.com/hex7c0/supergiovane/tree/master/examples)

### [License GPLv3](LICENSE)
