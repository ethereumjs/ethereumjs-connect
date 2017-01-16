ethereumjs-connect
==================

[![Build Status](https://travis-ci.org/ethereumjs/ethereumjs-connect.svg)](https://travis-ci.org/ethereumjs/ethereumjs-connect)
[![Coverage Status](https://coveralls.io/repos/ethereumjs/ethereumjs-connect/badge.svg?branch=master&service=github)](https://coveralls.io/github/ethereumjs/ethereumjs-connect?branch=master)
[![npm version](https://badge.fury.io/js/ethereumjs-connect.svg)](http://badge.fury.io/js/ethereumjs-connect)

ethereumjs-connect automates a few basic Ethereum network connection tasks.

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
To specify the connection endpoint, pass your RPC/IPC connection info to `connector.connect`:
```javascript
// Connect with only HTTP RPC support
connector.connect({http: "http://localhost:8545"});

// Connect to a local node using HTTP (on port 8545) and WebSockets (on port 8546)
connector.connect({http: "http://localhost:8545", ws: "ws://localhost:8546"});

// Connect to a local Ethereum node with IPC support
var ipcpath = require("path").join(process.env.HOME, ".ethereum", "geth.ipc");
connector.connect({http: "http://localhost:8545", ipcpath: ipcpath});
```
If the last argument provided to `connector.connect` is a function, it will connect asynchronously:
```javascript
connector.connect({http: "https://eth3.augur.net", ws: "ws://ws.augur.net"}, function (connected) { ... });
```

After connecting, several network properties are attached to the `connector` object:
```javascript
connector.networkID
connector.from       // sets "from" for outgoing transactions
connector.coinbase
connector.connection // connection info
connector.contracts  // contract addresses
connector.debug      // display debugging logs
```
`connector.from` is used to set the `from` field for outgoing transactions.  By default, it is set to the coinbase address.  However, you can manually set it to something else (for example, for client-side transactions):
```javascript
connector.setFrom("0x05ae1d0ca6206c6168b42efcd1fbe0ed144e821b");
```

Tests
-----

ethereumjs-connect uses Mocha for automated testing.
```
$ npm test
```
