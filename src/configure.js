"use strict";

var clone = require("clone");

function createEthrpcConfiguration(configuration) {
  var ethrpcConfiguration = {
    connectionTimeout: 60000,
    errorHandler: function (err) { if (err) console.error(err); }
  };
  ethrpcConfiguration.httpAddresses = configuration.httpAddresses;
  ethrpcConfiguration.wsAddresses = configuration.wsAddresses;
  ethrpcConfiguration.ipcAddresses = configuration.ipcAddresses;
  return ethrpcConfiguration;
}

// upgrade from old config (single address per type) to new config (array of addresses per type)
function createConfiguration(options) {
  var configuration = clone(options);
  configuration.contracts = configuration.contracts || {};
  if (!Array.isArray(configuration.httpAddresses)) configuration.httpAddresses = [];
  if (!Array.isArray(configuration.wsAddresses)) configuration.wsAddresses = [];
  if (!Array.isArray(configuration.ipcAddresses)) configuration.ipcAddresses = [];
  if (typeof configuration.http === "string") configuration.httpAddresses.push(configuration.http);
  if (typeof configuration.ws === "string") configuration.wsAddresses.push(configuration.ws);
  if (typeof configuration.ipc === "string") configuration.ipcAddresses.push(configuration.ipc);
  return configuration;
}

module.exports.createEthrpcConfiguration = createEthrpcConfiguration;
module.exports.createConfiguration = createConfiguration;
