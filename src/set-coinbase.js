"use strict";

// this is a best effort, if coinbase isn't available then just move on
function setCoinbase(rpc, callback) {
  rpc.coinbase(function (coinbase) {
    if (!coinbase) return callback(null, null);
    if (coinbase.error || coinbase === "0x") return callback(null, null);
    callback(null, coinbase);
  });
}

module.exports = setCoinbase;
