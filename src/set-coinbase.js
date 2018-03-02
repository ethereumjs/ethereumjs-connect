"use strict";

// this is a best effort, if coinbase isn't available then just move on
function setCoinbase(rpc, callback) {
  rpc.coinbase(function (err, coinbase) {
    if (!coinbase || err || coinbase === "0x") return callback(null, null);
    callback(null, coinbase);
  });
}

module.exports = setCoinbase;
