"use strict";

function setGasPrice(rpc, callback) {
  rpc.eth.gasPrice(function (gasPrice) {
    if (!gasPrice) return callback(new Error("setGasPrice failed"));
    if (gasPrice.error) return callback(new Error(gasPrice.error));
    callback(null, parseInt(gasPrice, 16));
  });
}

module.exports = setGasPrice;
