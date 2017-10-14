"use strict";

var rpc = require("ethrpc");
var asyncConnect = require("./async-connect");
var createConfiguration = require("./create-configuration");

function connect(options, callback) {
  var configuration = createConfiguration(options || {});
  if (typeof callback !== "function") callback = function () {};
  asyncConnect(configuration.rpc || rpc, configuration, function (err, vitals) {
    vitals.rpc = configuration.rpc || rpc;
    callback(err, vitals);
  });
}

module.exports = connect;
