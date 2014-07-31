# [supergiovane](https://github.com/hex7c0/supergiovane)
[![NPM version](https://badge.fury.io/js/supergiovane.svg)](http://badge.fury.io/js/supergiovane)
[![Build Status](https://travis-ci.org/hex7c0/supergiovane.svg?branch=master)](https://travis-ci.org/hex7c0/supergiovane)
[![devDependency Status](https://david-dm.org/hex7c0/supergiovane/dev-status.svg)](https://david-dm.org/hex7c0/supergiovane#info=devDependencies)

[![supergiovane logo](https://raw.githubusercontent.com/hex7c0/supergiovane/master/public/img/sp.jpg)](http://supergiovane.tk)

Website for get info about npm module.
Write with [Bootstrap](http://getbootstrap.com/) & [Angular](https://angularjs.org/)

## Installation

Install through NPM

```
npm install supergiovane
```
or
```
git clone git://github.com/hex7c0/supergiovane.git
```

## API

```js
var supergiovane = require('supergiovane');

supergiovane(options);
```

### supergiovane(options)

#### options

 - `env` - **String** Selected environment *(default "production")*
 - `host` - **String** Which host accept connection from web *(default "127.0.0.1")*
 - `port` - **Integer** Which port accept connection from web *(default "3000")*
 - `referer` - **String** Which referer send data *(default "http://127.0.0.1")*
 - `dir` - **String** Absolute path of web files directory *(default "/public")*
 - `logger` - **Object | false** Configuration for [`logger-request`](https://github.com/hex7c0/logger-request) or disable *(default "standard")*
 - `timeout` - **Object | false** Configuration for [`timeout-request`](https://github.com/hex7c0/timeout-request) or disable *(default "standard")*
 - `sitemap` - **Object | false** Configuration for [`express-sitemap`](https://github.com/hex7c0/express-sitemap) or disable *(default "standard")*

#### Examples

Take a look at my [examples](https://github.com/hex7c0/supergiovane/tree/master/examples)

## License
Copyright (c) 2014 hex7c0

Licensed under the GPLv3 license.
