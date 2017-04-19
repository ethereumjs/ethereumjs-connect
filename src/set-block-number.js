"use strict";

function setBlockNumber(rpc, callback) {
  var blockNumber;
  if (typeof callback !== "function") {
    blockNumber = rpc.blockNumber();
    if (blockNumber == null) throw new Error("setBlockNumber failed");
    if (blockNumber.error) throw new Error(blockNumber.error);
    return blockNumber;
  }
  rpc.blockNumber(function (blockNumber) {
    if (blockNumber == null) return callback(new Error("setBlockNumber failed"));
    if (blockNumber.error) return callback(new Error(blockNumber.error));
    callback(null, blockNumber);
  });
}

module.exports = setBlockNumber;
