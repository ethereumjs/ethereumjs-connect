"use strict";

var rpc = require("ethrpc");
var asyncConnect = require("./async-connect");
var syncConnect = require("./sync-connect");
var createConfiguration = require("./configure").createConfiguration;

function connect(options, callback) {
  var configuration = createConfiguration(options || {});
  if (typeof callback !== "function") {
    try {
      return syncConnect(rpc, configuration);
    } catch (exc) {
      return exc;
    }
  }
  asyncConnect(rpc, configuration, function (err, vitals) {
    if (err) return callback(err);
    callback(vitals);
  });
}

module.exports = connect;
