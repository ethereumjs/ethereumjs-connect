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

module.exports = {

  version: "2.3.1",

  debug: false,
  rpc: rpc,

  state: {
    from: null,
    coinbase: null,
    networkID: null,
    contracts: null,
    allContracts: null,
    api: {events: null, functions: null},
    connection: null
  },

  resetState: function () {
    this.rpc.reset(true);
    this.state = {
      from: null,
      coinbase: null,
      networkID: null,
      contracts: null,
      allContracts: null,
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
      var gasPrice = this.rpc.getGasPrice();
      if (!gasPrice) throw new Error("setGasPrice failed");
      if (gasPrice.error) throw new Error(gasPrice.error);
      this.rpc.gasPrice = parseInt(gasPrice, 16);
    } else {
      this.rpc.getGasPrice(function (gasPrice) {
        if (!gasPrice) return callback(new Error("setGasPrice failed"));
        if (gasPrice.error) return callback(new Error(gasPrice.error));
        self.rpc.gasPrice = parseInt(gasPrice, 16);
        callback(null);
      });
    }
  },

  setNetworkID: function (callback) {
    var self = this;
    if (!isFunction(callback)) {
      var version = this.rpc.version();
      if (version === null || version === undefined) throw new Error("setNetworkID failed");
      if (version.error) throw new Error(version.error);
      this.state.networkID = version;
      this.rpc.networkID = version;
    } else {
      this.rpc.version(function (version) {
        if (version === null || version === undefined) return callback(new Error("setNetworkID failed"));
        if (version.error) return callback(new Error(version.error));
        self.state.networkID = version;
        self.rpc.networkID = version;
        callback(null);
      });
    }
  },

  setLatestBlock: function (callback) {
    var self = this;
    if (this.rpc.block !== null && this.rpc.block.number && this.rpc.block.timestamp) {
      if (isFunction(callback)) callback(null);
    } else {
      if (!isFunction(callback)) {
        var blockNumber = this.rpc.blockNumber();
        if (!blockNumber) throw new Error("setLatestBlock failed");
        if (blockNumber.error) throw new Error(blockNumber.error);
        var block = this.rpc.getBlock(blockNumber, false);
        if (!block) throw new Error("setLatestBlock failed");
        if (block.error) throw new Error(block.error);
        this.rpc.onNewBlock(block);
      } else {
        this.rpc.blockNumber(function (blockNumber) {
          if (!blockNumber) return callback(new Error("setLatestBlock failed"));
          if (blockNumber.error) return callback(new Error(blockNumber.error));
          self.rpc.getBlock(blockNumber, false, function (block) {
            if (!block) return callback(new Error("setLatestBlock failed"));
            if (block.error) return callback(new Error(block.error));
            self.rpc.onNewBlock(block);
            callback(null);
          });
        });
      }
    }
  },

  setFrom: function (account) {
    this.state.from = this.state.from || account;
    if (this.state.api.functions) {
      for (var contract in this.state.api.functions) {
        if (!this.state.api.functions.hasOwnProperty(contract)) continue;
        for (var method in this.state.api.functions[contract]) {
          if (!this.state.api.functions[contract].hasOwnProperty(method)) continue;
          this.state.api.functions[contract][method].from = account || this.state.from;
        }
      }
    }
  },

  setCoinbase: function (callback) {
    var self = this;
    if (!isFunction(callback)) {
      var coinbase = this.rpc.coinbase();
      if (!coinbase) throw new Error("setCoinbase failed");
      if (coinbase.error || coinbase === "0x") throw new Error(coinbase);
      this.state.coinbase = coinbase;
      this.state.from = this.state.from || coinbase;
    } else {
      this.rpc.coinbase(function (coinbase) {
        if (!coinbase) return callback(new Error("setCoinbase failed"));
        if (coinbase.error || coinbase === "0x") return callback(new Error(coinbase));
        self.state.coinbase = coinbase;
        self.state.from = self.state.from || coinbase;
        callback(null);
      });
    }
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
      this.setLatestBlock.bind(this),
      function (next) {
        self.setContracts();
        next();
      },
      this.setCoinbase.bind(this),
      function (next) {
        self.setFrom();
        self.setupFunctionsAPI();
        self.setupEventsAPI();
        next();
      },
      this.setGasPrice.bind(this)
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
      this.setLatestBlock();
      this.setContracts();
      this.setCoinbase();
      this.setFrom();
      this.setupFunctionsAPI();
      this.setupEventsAPI();
      this.setGasPrice();
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
    this.state.allContracts = options.contracts || {};
    if (options.api) this.state.api = clone(options.api);
    if (options.noFallback) {
      this.rpc.disableHostedNodeFallback();
    } else {
      this.rpc.enableHostedNodeFallback();
    }

    // if this is the first attempt to connect, connect using the
    // parameters provided by the user exactly
    if ((options.http || options.ipc || options.ws) && (!options.attempts || options.noFallback)) {
      this.rpc.ipcpath = options.ipc || null;
      this.rpc.nodes.local = options.http;
      this.rpc.nodes.hosted = [];
      this.rpc.wsUrl = options.ws;
      this.rpc.rpcStatus.ws = 0;
      this.rpc.rpcStatus.ipc = 0;

    // if this is the second attempt to connect, fall back to the default hosted nodes
    } else {
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
    this.asyncConnect(options || {}, callback);
  }
};
