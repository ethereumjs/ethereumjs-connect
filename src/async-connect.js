"use strict";

var async = require("async");
var setNetworkID = require("./set-network-id");
var setBlockNumber = require("./set-block-number");
var setGasPrice = require("./set-gas-price");
var setCoinbase = require("./set-coinbase");
var setContracts = require("./set-contracts");
var setFrom = require("./set-from");
var setupEventsABI = require("./setup-events-abi");
var setupFunctionsABI = require("./setup-functions-abi");
var createEthrpcConfiguration = require("./create-ethrpc-configuration");

// asynchronous connection sequence
function asyncConnect(rpc, configuration, callback) {
  rpc.connect(createEthrpcConfiguration(configuration), function () {
    async.parallel({
      networkID: function (next) { setNetworkID(rpc, next); },
      blockNumber: function (next) { setBlockNumber(rpc, next); },
      gasPrice: function (next) { setGasPrice(rpc, next); },
      coinbase: function (next) { setCoinbase(rpc, next); }
    }, function (err, vitals) {
      var eventsABI, functionsABI;
      if (err) return callback(err);
      vitals.contracts = setContracts(vitals.networkID, configuration.contracts);
      vitals.abi = {};
      eventsABI = setupEventsABI((configuration.abi || {}).events, vitals.contracts);
      functionsABI = setupFunctionsABI(setFrom((configuration.abi || {}).functions, vitals.coinbase), vitals.contracts);
      if (eventsABI) vitals.abi.events = eventsABI;
      if (functionsABI) vitals.abi.functions = functionsABI;
      callback(null, vitals);
    });
  });
}

module.exports = asyncConnect;
