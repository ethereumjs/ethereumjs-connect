"use strict";

function setGasPrice(rpc, callback) {
  rpc.eth.gasPrice(function (err, gasPrice) {
    if (err) return callback(err);
    if (!gasPrice) return callback(new Error("setGasPrice failed"));
    callback(null, parseInt(gasPrice, 16));
  });
}

module.exports = setGasPrice;
