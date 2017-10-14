/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var setBlockNumber = require("../src/set-block-number");

describe("set-block-number", function () {
  var test = function (t) {
    it(t.description, function (done) {
      setBlockNumber(t.rpc, function (err, blockNumber) {
        t.assertions(err, blockNumber);
        done();
      });
    });
  };
  test({
    description: "set current block number",
    rpc: {
      blockNumber: function (callback) {
        if (!callback) return "0x1234";
        callback("0x1234");
      }
    },
    assertions: function (err, blockNumber) {
      assert.strictEqual(blockNumber, "0x1234");
    }
  });
  test({
    description: "blockNumber is undefined",
    rpc: {
      blockNumber: function (callback) {
        if (!callback) return undefined;
        callback(undefined);
      }
    },
    assertions: function (err, blockNumber) {
      assert.isTrue(err instanceof Error);
      assert.isUndefined(blockNumber);
    }
  });
  test({
    description: "blockNumber is null",
    rpc: {
      blockNumber: function (callback) {
        if (!callback) return null;
        callback(null);
      }
    },
    assertions: function (err, blockNumber) {
      assert.isTrue(err instanceof Error);
      assert.isUndefined(blockNumber);
    }
  });
});
