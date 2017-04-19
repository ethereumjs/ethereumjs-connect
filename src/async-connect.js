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
      var eventsAPI, functionsAPI;
      if (err) return callback(err);
      vitals.contracts = setContracts(vitals.networkID, configuration.contracts);
      vitals.api = {};
      eventsAPI = setupEventsAPI((configuration.api || {}).events, vitals.contracts);
      functionsAPI = setupFunctionsAPI(setFrom((configuration.api || {}).functions, vitals.coinbase), vitals.contracts);
      if (eventsAPI) vitals.api.events = eventsAPI;
      if (functionsAPI) vitals.api.functions = functionsAPI;
      callback(null, vitals);
    });
  });
}

module.exports = asyncConnect;
