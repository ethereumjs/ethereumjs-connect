"use strict";

var setNetworkID = require("./set-network-id");
var setBlockNumber = require("./set-block-number");
var setGasPrice = require("./set-gas-price");
var setCoinbase = require("./set-coinbase");
var setContracts = require("./set-contracts");
var setFrom = require("./set-from");
var setupEventsABI = require("./setup-events-abi");
var setupFunctionsABI = require("./setup-functions-abi");
var createEthrpcConfiguration = require("./create-ethrpc-configuration");

var noop = function () {};

// synchronous connection sequence
function syncConnect(rpc, configuration) {
  var eventsABI, functionsABI, vitals = {};
  rpc.connect(createEthrpcConfiguration(configuration));
  rpc.blockNumber(noop);
  vitals.networkID = setNetworkID(rpc);
  vitals.blockNumber = setBlockNumber(rpc);
  vitals.gasPrice = setGasPrice(rpc);
  vitals.coinbase = setCoinbase(rpc);
  vitals.contracts = setContracts(vitals.networkID, configuration.contracts);
  vitals.abi = {};
  eventsABI = setupEventsABI((configuration.abi || {}).events, vitals.contracts);
  functionsABI = setupFunctionsABI(setFrom((configuration.abi || {}).functions, vitals.coinbase), vitals.contracts);
  if (eventsABI) vitals.abi.events = eventsABI;
  if (functionsABI) vitals.abi.functions = functionsABI;
  return vitals;
}

module.exports = syncConnect;
