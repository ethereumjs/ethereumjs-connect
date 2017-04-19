"use strict";

// this is a best effort, if coinbase isn't available then just move on
function setCoinbase(rpc, callback) {
  var coinbase;
  if (typeof callback !== "function") {
    coinbase = rpc.coinbase();
    if (!coinbase) return null;
    if (coinbase.error || coinbase === "0x") return null;
    return coinbase;
  }
  rpc.coinbase(function (coinbase) {
    if (!coinbase) return callback(null, null);
    if (coinbase.error || coinbase === "0x") return callback(null, null);
    callback(null, coinbase);
  });
}

module.exports = setCoinbase;
