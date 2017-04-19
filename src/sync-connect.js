"use strict";

var setNetworkID = require("./set-network-id");
var setBlockNumber = require("./set-block-number");
var setGasPrice = require("./set-gas-price");
var setCoinbase = require("./set-coinbase");
var setContracts = require("./set-contracts");
var setFrom = require("./set-from");
var setupEventsAPI = require("./setup-events-api");
var setupFunctionsAPI = require("./setup-functions-api");
var createEthrpcConfiguration = require("./create-ethrpc-configuration");

var noop = function () {};

// synchronous connection sequence
function syncConnect(rpc, configuration) {
  var eventsAPI, functionsAPI, vitals = {};
  rpc.connect(createEthrpcConfiguration(configuration));
  rpc.blockNumber(noop);
  vitals.networkID = setNetworkID(rpc);
  vitals.blockNumber = setBlockNumber(rpc);
  vitals.gasPrice = setGasPrice(rpc);
  vitals.coinbase = setCoinbase(rpc);
  vitals.contracts = setContracts(vitals.networkID, configuration.contracts);
  vitals.api = {};
  eventsAPI = setupEventsAPI((configuration.api || {}).events, vitals.contracts);
  functionsAPI = setupFunctionsAPI(setFrom((configuration.api || {}).functions, vitals.coinbase), vitals.contracts);
  if (eventsAPI) vitals.api.events = eventsAPI;
  if (functionsAPI) vitals.api.functions = functionsAPI;
  return vitals;
}

module.exports = syncConnect;
