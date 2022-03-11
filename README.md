# precondition

This module provides utilites for evaluating conditional requests (as defined in RFC 7232)

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```sh
$ npm install precondition
```
## Usage

```js
var precondition = require('precondition')
```
### new precondition(req, options)

#### req

`req` nodejs request object

#### options

The `precondition` constructor take an `options` argument which should be any one
of the following

##### weak
when set to `true`, enable weak etag comparison. Defaults to `false`

##### etag

String value represents the resources etag metadata.

##### lastModified

Resource last-modified date as http-date string

### example

```js
var Precondition = require('precondition')

var precondition = new precondition(req, {weak: true, etag: 'W/blahblahblah'})
```
### precondition.condition
Returns the result of evaluating the preconditions in the request

```js
var Precondition = require('precondition')

var precondition = new precondition(req, {weak: true, etag: 'W/blahblahblah'})

if (precondition.condition) {
  res.status(200)
}
```
### Precondition.isRange(req)

Returns `true` if request contains an `if-range` precondition header field

### Precondition.isCacheRevalidation(req)

Return `true` if request is a cache revalidation request

### Precondition.isConditional(req)

Returns `true` if request is a conditional request


## License

[MIT License](http://www.opensource.org/licenses/mit-license.php)

# Author

[Bryan Elee](https://github.com/rxbryan) ([rxbryn@gmail.com](mailto:rxbryn@gmail.com))