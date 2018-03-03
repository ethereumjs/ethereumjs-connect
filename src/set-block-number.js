"use strict";

function setBlockNumber(rpc, callback) {
  rpc.blockNumber(function (err, blockNumber) {
    if (err) return callback(err);
    if (blockNumber == null) return callback(new Error("setBlockNumber failed"));
    callback(null, blockNumber);
  });
}

module.exports = setBlockNumber;
