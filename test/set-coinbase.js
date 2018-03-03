/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var setCoinbase = require("../src/set-coinbase");

describe("set-coinbase", function () {
  var test = function (t) {
    it(t.description, function (done) {
      setCoinbase(t.rpc, function (err, coinbase) {
        t.assertions(err, coinbase);
        done();
      });
    });
  };
  test({
    description: "set coinbase address",
    rpc: {
      coinbase: function (callback) {
        callback(null, "0xb0b");
      }
    },
    assertions: function (err, coinbase) {
      assert.strictEqual(coinbase, "0xb0b");
    }
  });
  test({
    description: "coinbase is 0x (no response)",
    rpc: {
      coinbase: function (callback) {
        callback(null, "0x");
      }
    },
    assertions: function (err, coinbase) {
      assert.isNull(err);
      assert.isNull(coinbase);
    }
  });
  test({
    description: "coinbase is undefined",
    rpc: {
      coinbase: function (callback) {
        callback(null, undefined);
      }
    },
    assertions: function (err, coinbase) {
      assert.isNull(err);
      assert.isNull(coinbase);
    }
  });
  test({
    description: "coinbase is null",
    rpc: {
      coinbase: function (callback) {
        callback(null, null);
      }
    },
    assertions: function (err, coinbase) {
      assert.isNull(err);
      assert.isNull(coinbase);
    }
  });
});
