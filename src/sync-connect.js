"use strict";

var setNetworkID = require("./set-network-id");
var setBlockNumber = require("./set-block-number");
var setGasPrice = require("./set-gas-price");
var setCoinbase = require("./set-coinbase");
var setContracts = require("./set-contracts");
var setFrom = require("./set-from");
var setupEventsAPI = require("./setup-events-api");
var setupFunctionsAPI = require("./setup-functions-api");
var createEthrpcConfiguration = require("./configure").createEthrpcConfiguration;

var noop = function () {};

// synchronous connection sequence
function syncConnect(rpc, configuration) {
  var vitals = {};
  rpc.connect(createEthrpcConfiguration(configuration));
  rpc.blockNumber(noop);
  vitals.networkID = setNetworkID(rpc);
  vitals.blockNumber = setBlockNumber(rpc);
  vitals.gasPrice = setGasPrice(rpc);
  vitals.coinbase = setCoinbase(rpc);
  vitals.contracts = setContracts(vitals.networkID, configuration.contracts);
  vitals.api = {
    events: setupEventsAPI(configuration.api.events, vitals.contracts),
    functions: setupFunctionsAPI(setFrom(configuration.api.functions, vitals.coinbase), vitals.contracts)
  };
  return vitals;
}

module.exports = syncConnect;
