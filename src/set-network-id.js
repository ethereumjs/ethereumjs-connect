"use strict";

function setNetworkID(rpc, callback) {
  rpc.version(function (err, networkID) {
    if (err) return callback(err);
    if (networkID == null) return callback(new Error("setNetworkID failed"));
    callback(null, networkID);
  });
}

module.exports = setNetworkID;
