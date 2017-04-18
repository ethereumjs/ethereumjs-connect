"use strict";

var async = require("async");
var setNetworkID = require("./set-network-id");
var setBlockNumber = require("./set-block-number");
var setGasPrice = require("./set-gas-price");
var setCoinbase = require("./set-coinbase");
var setContracts = require("./set-contracts");
var setFrom = require("./set-from");
var setupEventsAPI = require("./setup-events-api");
var setupFunctionsAPI = require("./setup-functions-api");
var createEthrpcConfiguration = require("./configure").createEthrpcConfiguration;

// asynchronous connection sequence
function asyncConnect(rpc, configuration, callback) {
  rpc.connect(createEthrpcConfiguration(configuration), function () {
    async.parallel({
      networkID: function (next) { setNetworkID(rpc, next); },
      blockNumber: function (next) { setBlockNumber(rpc, next); },
      gasPrice: function (next) { setGasPrice(rpc, next); },
      coinbase: function (next) { setCoinbase(rpc, next); }
    }, function (err, vitals) {
      if (err) return callback(err);
      vitals.contracts = setContracts(vitals.networkID, configuration.contracts);
      vitals.api = {
        events: setupEventsAPI(configuration.api.events, vitals.contracts),
        functions: setupFunctionsAPI(setFrom(configuration.api.functions, vitals.coinbase), vitals.contracts)
      };
      callback(null, vitals);
    });
  });
}

module.exports = asyncConnect;
