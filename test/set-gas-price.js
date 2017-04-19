/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var setGasPrice = require("../src/set-gas-price");

describe("set-gas-price", function () {
  var test = function (t) {
    describe(t.description, function () {
      it("sync", function () {
        var gasPrice;
        try {
          gasPrice = setGasPrice(t.rpc);
          t.assertions(null, gasPrice);
        } catch (exc) {
          t.assertions(exc, gasPrice);
        }
      });
      it("async", function (done) {
        setGasPrice(t.rpc, function (err, gasPrice) {
          t.assertions(err, gasPrice);
          done();
        });
      });
    });
  };
  test({
    description: "set current gas price",
    rpc: {
      gasPrice: function (callback) {
        if (!callback) return "0x1234";
        callback("0x1234");
      }
    },
    assertions: function (err, gasPrice) {
      assert.strictEqual(gasPrice, 4660);
    }
  });
  test({
    description: "gasPrice is undefined",
    rpc: {
      gasPrice: function (callback) {
        if (!callback) return undefined;
        callback(undefined);
      }
    },
    assertions: function (err, gasPrice) {
      assert.isTrue(err instanceof Error);
      assert.isUndefined(gasPrice);
    }
  });
  test({
    description: "gasPrice is null",
    rpc: {
      gasPrice: function (callback) {
        if (!callback) return null;
        callback(null);
      }
    },
    assertions: function (err, gasPrice) {
      assert.isTrue(err instanceof Error);
      assert.isUndefined(gasPrice);
    }
  });
});
