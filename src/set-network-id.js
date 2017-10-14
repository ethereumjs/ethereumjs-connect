"use strict";

function setNetworkID(rpc, callback) {
  rpc.version(function (networkID) {
    if (networkID == null) return callback(new Error("setNetworkID failed"));
    if (networkID.error) return callback(new Error(networkID.error));
    callback(null, networkID);
  });
}

module.exports = setNetworkID;
