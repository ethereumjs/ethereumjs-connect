/**
 * Basic Ethereum connection tasks.
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var async = require("async");
var clone = require("clone");
var rpc = require("ethrpc");

function noop() {}

function isFunction(f) {
  return Object.prototype.toString.call(f) === "[object Function]";
}

function getKeyFromValue(o, value) {
  for (var key in o) {
    if (o.hasOwnProperty(key)) {
      if (o[key] === value) return key;
    }
  }
}

module.exports = {

  version: "2.0.0",

  debug: false,
  rpc: rpc,

  state: {
    from: null,
    coinbase: null,
    networkID: null,
    contracts: null,
    allContracts: null,
    initialContracts: null,
    api: {events: null, functions: null},
    connection: null
  },

  resetState: function () {
    this.rpc.reset();
    this.state = {
      from: null,
      coinbase: null,
      networkID: null,
      contracts: null,
      allContracts: null,
      initialContracts: null,
      api: {events: null, functions: null},
      connection: null
    };
  },

  setContracts: function () {
    this.state.contracts = clone(this.state.allContracts[this.state.networkID]);
  },

  setupFunctionsAPI: function () {
    if (this.state.api.functions) {
      for (var contract in this.state.api.functions) {
        if (!this.state.api.functions.hasOwnProperty(contract)) continue;
        for (var method in this.state.api.functions[contract]) {
          if (!this.state.api.functions[contract].hasOwnProperty(method)) continue;
          this.state.api.functions[contract][method].to = this.state.contracts[contract];
        }
      }
    }
  },

  setupEventsAPI: function () {
    if (this.state.api.events) {
      for (var event in this.state.api.events) {
        if (!this.state.api.events.hasOwnProperty(event)) continue;
        this.state.api.events[event].address = this.state.contracts[this.state.api.events[event].contract];
      }
    }
  },

  setGasPrice: function (callback) {
    var self = this;
    if (!isFunction(callback)) {
      this.rpc.gasPrice = parseInt(this.rpc.getGasPrice(), 16);
    } else {
      this.rpc.getGasPrice(function (gasPrice) {
        if (!gasPrice || gasPrice.error) return callback(gasPrice);
        self.rpc.gasPrice = parseInt(gasPrice, 16);
        callback(null);
      });
    }
  },

  setNetworkID: function (callback) {
    var self = this;
    if (!isFunction(callback)) {
      this.state.networkID = this.rpc.version();
    } else {
      this.rpc.version(function (version) {
        if (version === null || version === undefined || version.error) {
          return callback(version);
        }
        self.state.networkID = version;
        callback(null);
      });
    }
  },

  setFrom: function (account) {
    this.state.from = this.state.from || account;
    for (var contract in this.state.api.functions) {
      if (!this.state.api.functions.hasOwnProperty(contract)) continue;
      for (var method in this.state.api.functions[contract]) {
        if (!this.state.api.functions[contract].hasOwnProperty(method)) continue;
        this.state.api.functions[contract][method].from = account || this.state.from;
      }
    }
  },

  setCoinbase: function (callback) {
    var self = this;
    if (!isFunction(callback)) {
      var coinbase = this.rpc.coinbase();
      if (!coinbase || coinbase.error || coinbase === "0x") {
        throw new Error("[ethereumjs-connect] setCoinbase: coinbase not found");
      }
      this.state.coinbase = coinbase;
      this.state.from = this.state.from || coinbase;
    } else {
      this.rpc.coinbase(function (coinbase) {
        if (!coinbase || coinbase.error || coinbase === "0x") {
          return callback(new Error("[ethereumjs-connect] setCoinbase: coinbase not found"));
        }
        self.state.coinbase = coinbase;
        self.state.from = self.state.from || coinbase;
        return callback(null);
      });
    }
  },

  updateContracts: function () {
    var key;
    if (JSON.stringify(this.state.initialContracts) !== JSON.stringify(this.state.contracts)) {
      for (var method in this.state.api.functions) {
        if (!this.state.api.functions.hasOwnProperty(method)) continue;
        if (!this.state.api.functions[method].method) {
          for (var m in this.state.api.functions[method]) {
            if (!this.state.api.functions[method].hasOwnProperty(m)) continue;
            key = getKeyFromValue(this.state.initialContracts, this.state.api.functions[method][m].to);
            if (key) {
              this.state.api.functions[method][m].to = this.state.contracts[key];
            }
          }
        } else {
          key = getKeyFromValue(this.state.initialContracts, this.state.api.functions[method].to);
          if (key) {
            this.state.api.functions[method].to = this.state.contracts[key];
          }
        }
      }
    }
    this.state.initialContracts = clone(this.state.contracts);
  },

  retryConnect: function (err, options, callback) {
    if (this.debug) {
      console.warn("[ethereumjs-connect] Couldn't connect to Ethereum", err, JSON.stringify(options, null, 2));
    }
    this.state.connection = null;
    if (!options.attempts) {
      options.attempts = 1;
      return this.connect(options, callback);
    }
    if (isFunction(callback)) callback(this.state.connection);
  },

  // asynchronous connection sequence
  asyncConnect: function (options, callback) {
    var self = this;
    async.series([
      function (next) {
        if (!options.http || !options.ws) return next();
        var wsUrl = self.rpc.wsUrl;
        var wsStatus = self.rpc.rpcStatus.ws;
        self.rpc.wsUrl = null;
        self.rpc.rpcStatus.ws = 0;
        self.setNetworkID(function (err) {
          self.rpc.wsUrl = wsUrl;
          self.rpc.rpcStatus.ws = wsStatus;
          next(err);
        });
      },
      this.setNetworkID.bind(this),
      this.setContracts.bind(this),
      this.setCoinbase.bind(this),
      this.setFrom.bind(this),
      this.setupFunctionsAPI.bind(this),
      this.setupEventsAPI.bind(this),
      this.setGasPrice.bind(this),
      this.updateContracts.bind(this)
    ], function (err) {
      if (err) return self.retryConnect(err, options, callback);
      self.state.connection = {
        http: self.rpc.nodes.local || self.rpc.nodes.hosted,
        ws: self.rpc.wsUrl,
        ipc: self.rpc.ipcpath
      };
      callback(self.state.connection);
    });
  },

  // synchronous connection sequence
  syncConnect: function (options) {    
    try {
      this.rpc.blockNumber(noop);
      this.setNetworkID();
      this.setContracts();
      this.setCoinbase();
      this.setFrom();
      this.setupFunctionsAPI();
      this.setupEventsAPI();
      this.setGasPrice();
      this.updateContracts();
      this.state.connection = {
        http: this.rpc.nodes.local || this.rpc.nodes.hosted,
        ws: this.rpc.wsUrl,
        ipc: this.rpc.ipcpath
      };
    } catch (exc) {
      this.retryConnect(exc, options);
    }
    return this.state.connection;
  },

  configure: function (options) {
    if (!options.contracts) {
      throw new Error("[ethereumjs-connect] options.contracts is required");
    }
    this.state.allContracts = options.contracts;
    if (options.api) this.state.api = clone(options.api);

    // if this is the first attempt to connect, connect using the
    // parameters provided by the user exactly
    if ((options.http || options.ipc || options.ws) && !options.attempts) {
      this.rpc.ipcpath = options.ipc || null;
      this.rpc.nodes.local = options.http;
      this.rpc.nodes.hosted = [];
      this.rpc.wsUrl = options.ws;
      this.rpc.rpcStatus.ws = 0;
      this.rpc.rpcStatus.ipc = 0;

    // if this is the second attempt to connect, fall back to the
    // default hosted nodes
    } else if (!options.noFallback) {
      if (this.debug) {
        console.debug("Connecting to fallback node...");
      }
      this.rpc.ipcpath = null;
      this.rpc.reset();
      this.rpc.useHostedNode();
      this.rpc.rpcStatus.ws = 0;
      this.rpc.rpcStatus.ipc = 0;
    }
  },

  connect: function (options, callback) {
    this.configure(options || {});
    if (!isFunction(callback)) return this.syncConnect(options);
    this.asyncConnect(options, callback);
  }
};
