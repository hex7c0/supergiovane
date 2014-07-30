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
 - `port` - **Integer** Which port accept connection of web console *(default "3000")*
 - `dir` - **String** Absolute path of web files directory *(default "/public")*
 - `logger` - **Object** Configuration for [`logger-request`](https://github.com/hex7c0/logger-request) *(default "standard")*
 - `timeout` - **Object** Configuration for [`timeout-request`](https://github.com/hex7c0/timeout-request) *(default "standard")*
 - `sitemap` - **Object** Configuration for [`express-sitemap`](https://github.com/hex7c0/express-sitemap) *(default "standard")*
 - `compression` - **Object** Configuration for `compression` *(default "standard")*

#### Examples

Take a look at my [examples](https://github.com/hex7c0/supergiovane/tree/master/examples)

## License
Copyright (c) 2014 hex7c0

Licensed under the GPLv3 license.
