"use strict";

function setGasPrice(rpc, callback) {
  var gasPrice;
  if (typeof callback !== "function") {
    gasPrice = rpc.eth.gasPrice();
    if (!gasPrice) throw new Error("setGasPrice failed");
    if (gasPrice.error) throw new Error(gasPrice.error);
    return parseInt(gasPrice, 16);
  }
  rpc.eth.gasPrice(function (gasPrice) {
    if (!gasPrice) return callback(new Error("setGasPrice failed"));
    if (gasPrice.error) return callback(new Error(gasPrice.error));
    callback(null, parseInt(gasPrice, 16));
  });
}

module.exports = setGasPrice;
