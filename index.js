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
  return typeof f === "function";
}

module.exports = {

  version: "3.0.8",

  debug: false,
  rpc: rpc,

  state: {
    from: null,
    coinbase: null,
    networkID: null,
    contracts: null,
    allContracts: null,
    api: {events: null, functions: null},
    connection: false
  },

  resetState: function () {
    this.rpc.resetState();
    this.state = {
      from: null,
      coinbase: null,
      networkID: null,
      contracts: null,
      allContracts: null,
      api: {events: null, functions: null},
      connection: false
    };
  },

  setContracts: function () {
    if (!this.state.allContracts.hasOwnProperty(this.state.networkID)) this.state.contracts = {};
    else this.state.contracts = clone(this.state.allContracts[this.state.networkID]);
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
    var originalCallback = callback;
    if (callback) callback = function (resultOrError) {
      if (resultOrError instanceof Error || resultOrError.error) originalCallback(resultOrError, null);
      else originalCallback(null, resultOrError);
    };
    return this.rpc.ensureLatestBlock(callback);
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
      if (!coinbase) return;
      if (coinbase.error || coinbase === "0x") return;
      this.state.coinbase = coinbase;
      this.state.from = this.state.from || coinbase;
    } else {
      this.rpc.coinbase(function (coinbase) {
        // this is a best effort, if coinbase isn't available then just move on
        if (!coinbase) return callback(null);
        if (coinbase.error || coinbase === "0x") return callback(null);
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
    this.state.connection = false;
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
        var configuration = ethereumJsConnectConfigToEthrpcConfig(options);
        self.rpc.connect(configuration, next);
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
      self.state.connection = true;
      callback(self.state.connection);
    });
  },

  // synchronous connection sequence
  syncConnect: function (options) {
    try {
      var configuration = ethereumJsConnectConfigToEthrpcConfig(options);
      this.rpc.connect(configuration);
      this.rpc.blockNumber(noop);
      this.setNetworkID();
      this.setLatestBlock();
      this.setContracts();
      this.setCoinbase();
      this.setFrom();
      this.setupFunctionsAPI();
      this.setupEventsAPI();
      this.setGasPrice();
      this.state.connection = true;
      return true;
    } catch (exc) {
      this.retryConnect(exc, options);
      return false;
    }
  },

  configure: function (options) {
    this.state.allContracts = options.contracts || {};
    if (!(options.httpAddresses instanceof Array)) options.httpAddresses = [];
    if (!(options.wsAddresses instanceof Array)) options.wsAddresses = [];
    if (!(options.ipcAddresses instanceof Array)) options.ipcAddresses = [];

    if (options.api) this.state.api = clone(options.api);

    // upgrade from old config (single address per type) to new config (array of addresses per type)
    if (typeof options.http === "string") options.httpAddresses.push(options.http);
    if (typeof options.ws === "string") options.wsAddresses.push(options.ws);
    if (typeof options.ipc === "string") options.ipcAddresses.push(options.ipc);
  },

  connect: function (options, callback) {
    this.configure(options || {});
    if (!isFunction(callback)) return this.syncConnect(options);
    this.asyncConnect(options || {}, callback);
  }
};

function ethereumJsConnectConfigToEthrpcConfig(ethereumJsConnectConfig) {
  var configuration = {
    connectionTimeout: 60000,
    errorHandler: function (error) {
      // TODO: what should we do with out-of-band errors?
      console.log(error);
    }
  };
  configuration.httpAddresses = ethereumJsConnectConfig.httpAddresses;
  configuration.wsAddresses = ethereumJsConnectConfig.wsAddresses;
  configuration.ipcAddresses = ethereumJsConnectConfig.ipcAddresses;

  return configuration;
}
