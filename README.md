ethereumjs-connect
==================

Handles basic Ethereum network connection tasks: gets the network ID, selects the right set of contracts for you (by default, it uses the [Augur contracts](https://github.com/AugurProject/augur-contracts), looks up your coinbase, etc.

Usage
-----
```
$ npm install ethereumjs-connect
```
To use ethereumjs-connect in Node.js, simply require it:
```javascript
var connector = require("ethereumjs-connect");
```
A minified, browserified file `dist/ethereumjs-connect.min.js` is included for use in the browser.  Including this file attaches a `connector` object to `window`:
```html
<script src="dist/ethereumjs-connect.min.js" type="text/javascript"></script>
```

Tests
-----

```
$ npm test
```
