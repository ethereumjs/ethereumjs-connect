# ethereumjs-connect

[![Build Status](https://travis-ci.org/ethereumjs/ethereumjs-connect.svg)](https://travis-ci.org/ethereumjs/ethereumjs-connect) [![Coverage Status](https://coveralls.io/repos/ethereumjs/ethereumjs-connect/badge.svg?branch=master&service=github)](https://coveralls.io/github/ethereumjs/ethereumjs-connect?branch=master) [![npm version](https://badge.fury.io/js/ethereumjs-connect.svg)](http://badge.fury.io/js/ethereumjs-connect)

ethereumjs-connect automates a few basic Ethereum network connection tasks: looks up the network ID, the coinbase address, sets the `from` field for transaction objects, and (optionally) will setup functions and events ABIs for use with [ethrpc](https://github.com/AugurProject/ethrpc).  For examples of contracts and API inputs, see [augur-contracts](https://github.com/AugurProject/augur-contracts).  (Important note: the static API setup in ethereumjs-connect is not yet compatible with [web3](https://github.com/ethereum/web3)!)

## Usage

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
var vitals = connector.connect({http: "http://localhost:8545", ipc: ipcpath});
// vitals fields;
//   networkID  // which blockchain you're connected to
//   coinbase   // sets the "from" address for outgoing transactions
//   contracts  // contract addresses
//   api        // static API data (for use with ethrpc transactions)
```

If the last argument provided to `connector.connect` is a function, it will connect asynchronously:

```javascript
connector.connect({http: "https://eth3.augur.net", ws: "ws://ws.augur.net"}, function (vitals) {
  /* woohoo */
});
```

By default, `vitals.coinbase` is used to set the `from` field for outgoing transactions.  However, you can manually set it to something else (for example, for client-side transactions):

```javascript
info.abi.functions = connector.setFrom(info.abi.functions, "0x0000000000000000000000000000000000000b0b");
```

## Tests

```
$ npm test
```
