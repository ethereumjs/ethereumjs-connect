"use strict";

function setNetworkID(rpc, callback) {
  var networkID;
  if (typeof callback !== "function") {
    networkID = rpc.version();
    if (networkID == null) throw new Error("setNetworkID failed");
    if (networkID.error) throw new Error(networkID.error);
    return networkID;
  }
  rpc.version(function (networkID) {
    if (networkID == null) return callback(new Error("setNetworkID failed"));
    if (networkID.error) return callback(new Error(networkID.error));
    callback(null, networkID);
  });
}

module.exports = setNetworkID;
