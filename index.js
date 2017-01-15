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

  from: null,
  coinbase: null,
  networkID: null,
  contracts: null,
  initialContracts: null,
  customContracts: null,
  api: {events: null, functions: null},

  connection: null,

  setContracts: function () {
    this.contracts = clone(this.allContracts[this.networkID]);
  },

  setupFunctionsAPI: function () {
    for (var contract in this.api.functions) {
      if (!this.api.functions.hasOwnProperty(contract)) continue;
      for (var method in this.api.functions[contract]) {
        if (!this.api.functions[contract].hasOwnProperty(method)) continue;
        this.api.functions[contract][method].to = this.contracts[contract];
      }
    }
  },

  setupEventsAPI: function () {
    for (var event in this.api.events) {
      if (!this.api.events.hasOwnProperty(event)) continue;
      this.api.events[event].address = this.contracts[this.api.events[event].contract];
    }
  },

  setGasPrice: function (callback) {
    var self = this;
    if (!isFunction(callback)) {
      this.rpc.gasPrice = parseInt(this.rpc.getGasPrice(), 16);
    }
    this.rpc.getGasPrice(function (gasPrice) {
      if (!gasPrice || gasPrice.error) return callback(gasPrice);
      self.rpc.gasPrice = parseInt(gasPrice, 16);
      callback(null);
    });
  },

  setNetworkID: function (callback) {
    var self = this;
    if (this.connection === null && JSON.stringify(this.initialContracts) === JSON.stringify(this.contracts)) {
      if (isFunction(callback)) {
        this.rpc.version(function (version) {
          if (version === null || version === undefined || version.error) {
            return callback(version);
          }
          self.networkID = version;
          callback(null, version);
        });
      } else {
        this.networkID = this.rpc.version();
        return this.networkID;
      }
    } else {
      if (isFunction(callback)) callback();
    }
  },

  setFrom: function (account) {
    this.from = this.from || account;
    for (var contract in this.api.functions) {
      if (!this.api.functions.hasOwnProperty(contract)) continue;
      for (var method in this.api.functions[contract]) {
        if (!this.api.functions[contract].hasOwnProperty(method)) continue;
        this.api.functions[contract][method].from = account || this.from;
      }
    }
  },

  setCoinbase: function (callback) {
    var self = this;
    if (isFunction(callback)) {
      this.rpc.coinbase(function (coinbase) {
        if (!coinbase || coinbase.error || coinbase === "0x") {
          return callback("[ethereumjs-connect] setCoinbase: coinbase not found");
        }
        self.coinbase = coinbase;
        self.from = self.from || coinbase;
        return callback(null);
      });
    } else {
      var coinbase = this.rpc.coinbase();
      if (!coinbase || coinbase.error || coinbase === "0x") {
        throw new Error("[ethereumjs-connect] setCoinbase: coinbase not found");
      }
      this.coinbase = coinbase;
      this.from = this.from || this.coinbase;
    }
  },

  updateContracts: function () {
    var key;
    if (JSON.stringify(this.initialContracts) !== JSON.stringify(this.contracts)) {
      for (var method in this.api.functions) {
        if (!this.api.functions.hasOwnProperty(method)) continue;
        if (!this.api.functions[method].method) {
          for (var m in this.api.functions[method]) {
            if (!this.api.functions[method].hasOwnProperty(m)) continue;
            key = getKeyFromValue(this.initialContracts, this.api.functions[method][m].to);
            if (key) {
              this.api.functions[method][m].to = this.contracts[key];
            }
          }
        } else {
          key = getKeyFromValue(this.initialContracts, this.api.functions[method].to);
          if (key) {
            this.api.functions[method].to = this.contracts[key];
          }
        }
      }
    }
    this.initialContracts = clone(this.contracts);
  },

  retryConnect: function (err, options, callback) {
    if (this.debug) {
      console.warn("[ethereumjs-connect] Couldn't connect to Ethereum", err, JSON.stringify(options, null, 2));
    }
    this.connection = null;
    if (!options.attempts) {
      options.attempts = 1;
      return this.connect(options, callback);
    }
    if (isFunction(callback)) callback(this.connection);
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
      self.connection = {
        http: self.rpc.nodes.local || self.rpc.nodes.hosted,
        ws: self.rpc.wsUrl,
        ipc: self.rpc.ipcpath
      };
      callback(self.connection);
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
      this.connection = {
        http: this.rpc.nodes.local || this.rpc.nodes.hosted,
        ws: this.rpc.wsUrl,
        ipc: this.rpc.ipcpath
      };
    } catch (exc) {
      this.retryConnect(exc, options);
    }
    return this.connection;
  },

  configure: function (options) {
    if (!options.contracts) {
      throw new Error("[ethereumjs-connect] options.contracts is required");
    }
    this.allContracts = options.contracts;
    if (options.api) this.api = clone(options.api);

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
