"use strict";

function setBlockNumber(rpc, callback) {
  rpc.blockNumber(function (blockNumber) {
    if (blockNumber == null) return callback(new Error("setBlockNumber failed"));
    if (blockNumber.error) return callback(new Error(blockNumber.error));
    callback(null, blockNumber);
  });
}

module.exports = setBlockNumber;
