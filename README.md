ethereumjs-connect
==================

[![Build Status](https://travis-ci.org/ethereumjs/ethereumjs-connect.svg)](https://travis-ci.org/ethereumjs/ethereumjs-connect)
[![Coverage Status](https://coveralls.io/repos/ethereumjs/ethereumjs-connect/badge.svg?branch=master&service=github)](https://coveralls.io/github/ethereumjs/ethereumjs-connect?branch=master)
[![npm version](https://badge.fury.io/js/ethereumjs-connect.svg)](http://badge.fury.io/js/ethereumjs-connect)

ethereumjs-connect handles basic Ethereum network connection tasks: it gets the network ID, selects the right set of contracts for you (by default, it uses the [Augur contracts](https://github.com/AugurProject/augur-contracts)), looks up the coinbase address, etc.

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
ethereumjs-connect can connect to an Ethereum node, which can be either remote (hosted) or local.  To specify the connection endpoint, pass your RPC/IPC connection info to `connector.connect`:
```javascript
// Connect with only HTTP RPC support
connector.connect({http: "http://localhost:8545"});

// Connect to a local node using HTTP (on port 8545) and WebSockets (on port 8546)
connector.connect({http: "http://localhost:8545", ws: "ws://localhost:8546"});
```
After connecting, several network properties are attached to the `connector` object:
```javascript
connector.network_id
connector.from       // sets "from" for outgoing transactions
connector.coinbase
connector.connection
connector.contracts  // contracts (indexed by network ID)
connector.tx         // ethrpc transaction objects
connector.debug      // turns on debugging logs
```
`connector.from` is used to set the `from` field for outgoing transactions.  By default, it is set to the coinbase address.  However, if you manually set it to something else (for example, for client-side transactions):
```javascript
connector.from = "0x05ae1d0ca6206c6168b42efcd1fbe0ed144e821b";
connector.connect({http: "http://localhost:8545"});
```
To connect to a remote Ethereum node, pass its address to `connector.connect`.  For example, to connect to one of Augur's public nodes:
```javascript
connector.connect({http: "https://eth3.augur.net", ws: "wss://ws.augur.net"});
```
The argument to `connector.connect` can also contain an `ipc` field, which is the path to geth's IPC (inter-process communication) file.  IPC creates a persistent connection using a Unix domain socket (named pipe on Windows).  This is significantly faster than HTTP RPC, but requires access to the filesystem, so it cannot be used from the browser.

For example, if your Ethereum data directory is `~/.ethereum`, then to connect to a local Ethereum node with IPC support:
```javascript
var ipcpath = require("path").join(process.env.HOME, ".ethereum", "geth.ipc");
connector.connect({http: "http://localhost:8545", ipcpath: ipcpath});
```
(Note: the `.ethereum/testnet` subdirectory has its own `geth.ipc` file which must be used to connect to geth via IPC on the Morden testnet.)

If the last argument provided to `connector.connect` is a function, it will connect asynchronously.  This is recommended, especially for in-browser use!  For example:
```javascript
connector.connect({http: "https://eth3.augur.net", ws: "ws://ws.augur.net"}, function (connected) {
    // fun times may be had here
});
```

Tests
-----

ethereumjs-connect uses Mocha for unit tests.  To run them:
```
$ npm test
```
