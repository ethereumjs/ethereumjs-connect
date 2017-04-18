/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var clone = require("clone");
var ethcon = require("../src");

describe("setGasPrice", function () {
  var test = function (t) {
    var getGasPrice = ethcon.rpc.getGasPrice;
    after(function () {
      ethcon.rpc.getGasPrice = getGasPrice;
    });
    describe(t.description, function () {
      it("sync", function () {
        ethcon.state = clone(t.state);
        ethcon.rpc.getGasPrice = function (callback) {
          if (!callback) return t.blockchain.gasPrice;
          callback(t.blockchain.gasPrice);
        };
        try {
          ethcon.setGasPrice();
          t.assertions(null, ethcon.rpc, ethcon.state);
        } catch (exc) {
          t.assertions(exc, ethcon.rpc, ethcon.state);
        }
        ethcon.resetState();
      });
      it("async", function (done) {
        ethcon.state = clone(t.state);
        ethcon.rpc.getGasPrice = function (callback) {
          if (!callback) return t.blockchain.gasPrice;
          callback(t.blockchain.gasPrice);
        };
        ethcon.setGasPrice(function (err) {
          t.assertions(err, ethcon.rpc, ethcon.state);
          ethcon.resetState();
          done();
        });
      });
    });
  };
  test({
    description: "set rpc.gasPrice to latest block value",
    blockchain: {
      gasPrice: "0x4a817c801"
    },
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: null,
      allContracts: {
        1: { myContract: "0xc1" },
        3: { myContract: "0xc3" }
      },
      api: { events: null, functions: null },
      connection: { http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null }
    },
    assertions: function (err, rpc, state) {
      assert.isNull(err);
      assert.strictEqual(rpc.gasPrice, 20000000001);
      assert.deepEqual(state, {
        from: "0xb0b",
        coinbase: "0xb0b",
        networkID: "3",
        contracts: null,
        allContracts: {
          1: { myContract: "0xc1" },
          3: { myContract: "0xc3" }
        },
        api: { events: null, functions: null },
        connection: { http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null }
      });
    }
  });
  test({
    description: "rpc.gasPrice the same as latest block value",
    blockchain: {
      gasPrice: "0x4a817c800"
    },
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: null,
      allContracts: {
        1: { myContract: "0xc1" },
        3: { myContract: "0xc3" }
      },
      api: { events: null, functions: null },
      connection: { http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null }
    },
    assertions: function (err, rpc, state) {
      assert.isNull(err);
      assert.strictEqual(rpc.gasPrice, 20000000000);
      assert.deepEqual(state, {
        from: "0xb0b",
        coinbase: "0xb0b",
        networkID: "3",
        contracts: null,
        allContracts: {
          1: { myContract: "0xc1" },
          3: { myContract: "0xc3" }
        },
        api: { events: null, functions: null },
        connection: { http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null }
      });
    }
  });
  test({
    description: "rpc.getGasPrice returns null",
    blockchain: {
      gasPrice: null
    },
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: null,
      allContracts: {
        1: { myContract: "0xc1" },
        3: { myContract: "0xc3" }
      },
      api: { events: null, functions: null },
      connection: { http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null }
    },
    assertions: function (err) {
      assert.strictEqual(err.constructor, Error);
      assert.strictEqual(err.message, "setGasPrice failed");
    }
  });
  test({
    description: "rpc.getGasPrice returns an error",
    blockchain: {
      gasPrice: { error: "epic fail" }
    },
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: null,
      allContracts: {
        1: { myContract: "0xc1" },
        3: { myContract: "0xc3" }
      },
      api: { events: null, functions: null },
      connection: { http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null }
    },
    assertions: function (err) {
      assert.strictEqual(err.constructor, Error);
      assert.strictEqual(err.message, "epic fail");
    }
  });
});
