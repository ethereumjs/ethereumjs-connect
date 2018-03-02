/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var setGasPrice = require("../src/set-gas-price");

describe("set-gas-price", function () {
  var test = function (t) {
    it(t.description, function (done) {
      setGasPrice(t.rpc, function (err, gasPrice) {
        t.assertions(err, gasPrice);
        done();
      });
    });
  };
  test({
    description: "set current gas price",
    rpc: {
      eth: {
        gasPrice: function (callback) {
          callback(null, "0x1234");
        }
      }
    },
    assertions: function (err, gasPrice) {
      assert.strictEqual(gasPrice, 4660);
    }
  });
  test({
    description: "gasPrice is undefined",
    rpc: {
      eth: {
        gasPrice: function (callback) {
          callback(null, undefined);
        }
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
      eth: {
        gasPrice: function (callback) {
          callback(null, null);
        }
      }
    },
    assertions: function (err, gasPrice) {
      assert.isTrue(err instanceof Error);
      assert.isUndefined(gasPrice);
    }
  });
});
