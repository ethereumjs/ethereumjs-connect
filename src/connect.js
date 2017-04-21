"use strict";

var rpc = require("ethrpc");
var asyncConnect = require("./async-connect");
var syncConnect = require("./sync-connect");
var createConfiguration = require("./create-configuration");

function connect(options, callback) {
  var vitals, configuration = createConfiguration(options || {});
  if (typeof callback !== "function") {
    try {
      vitals = syncConnect(configuration.rpc || rpc, configuration);
      vitals.rpc = configuration.rpc || rpc;
      return vitals;
    } catch (exc) {
      return exc;
    }
  }
  asyncConnect(configuration.rpc || rpc, configuration, function (err, vitals) {
    vitals.rpc = configuration.rpc || rpc;
    callback(err, vitals);
  });
}

module.exports = connect;
