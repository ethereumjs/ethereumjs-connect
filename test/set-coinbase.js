/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var clone = require("clone");
var ethcon = require("../src");

describe("setCoinbase", function () {
  var test = function (t) {
    var coinbase = ethcon.rpc.coinbase;
    after(function () {
      ethcon.rpc.coinbase = coinbase;
    });
    describe(t.description, function () {
      it("sync", function () {
        ethcon.rpc.coinbase = function (callback) {
          if (!callback) return t.blockchain.coinbase;
          callback(t.blockchain.coinbase);
        };
        ethcon.state = clone(t.state);
        try {
          ethcon.setCoinbase();
          t.assertions(null, ethcon.state);
        } catch (exc) {
          t.assertions(exc, ethcon.state);
        }
        ethcon.resetState();
      });
      it("async", function (done) {
        ethcon.rpc.coinbase = function (callback) {
          if (!callback) return t.blockchain.coinbase;
          callback(t.blockchain.coinbase);
        };
        ethcon.state = clone(t.state);
        ethcon.setCoinbase(function (err) {
          t.assertions(err, ethcon.state);
          ethcon.resetState();
          done();
        });
      });
    });
  };
  test({
    description: "set coinbase address, do not modify existing from address",
    blockchain: {
      coinbase: "0xb0b"
    },
    state: {
      from: "0xd00d",
      coinbase: null,
      networkID: "3",
      contracts: null,
      allContracts: {
        1: { myContract: "0xc1" },
        3: { myContract: "0xc3" }
      },
      api: { events: null, functions: null },
      connection: { http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null }
    },
    assertions: function (err, state) {
      assert.isNull(err);
      assert.strictEqual(state.coinbase, "0xb0b");
      assert.strictEqual(state.from, "0xd00d");
    }
  });
  test({
    description: "set coinbase and from addresses",
    blockchain: {
      coinbase: "0xb0b"
    },
    state: {
      from: null,
      coinbase: null,
      networkID: "3",
      contracts: null,
      allContracts: {
        1: { myContract: "0xc1" },
        3: { myContract: "0xc3" }
      },
      api: { events: null, functions: null },
      connection: { http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null }
    },
    assertions: function (err, state) {
      assert.isNull(err);
      assert.strictEqual(state.coinbase, "0xb0b");
      assert.strictEqual(state.from, "0xb0b");
    }
  });
  test({
    description: "coinbase unchanged, set from address",
    blockchain: {
      coinbase: "0xb0b"
    },
    state: {
      from: null,
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
    assertions: function (err, state) {
      assert.isNull(err);
      assert.strictEqual(state.coinbase, "0xb0b");
      assert.strictEqual(state.from, "0xb0b");
    }
  });
  test({
    description: "coinbase and from addresses unchanged",
    blockchain: {
      coinbase: "0xb0b"
    },
    state: {
      from: "0xd00d",
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
    assertions: function (err, state) {
      assert.isNull(err);
      assert.strictEqual(state.coinbase, "0xb0b");
      assert.strictEqual(state.from, "0xd00d");
    }
  });
  test({
    description: "no error if blockchain coinbase is 0x, coinbase and from unchanged",
    blockchain: {
      coinbase: "0x"
    },
    state: {
      from: "0xd00d",
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
    assertions: function (err, state) {
      assert.isNull(err);
      assert.strictEqual(state.coinbase, "0xb0b");
      assert.strictEqual(state.from, "0xd00d");
    }
  });
  test({
    description: "no error if blockchain coinbase is null, coinbase and from unchanged",
    blockchain: {
      coinbase: null
    },
    state: {
      from: "0xd00d",
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
    assertions: function (err, state) {
      assert.isNull(err);
      assert.strictEqual(state.coinbase, "0xb0b");
      assert.strictEqual(state.from, "0xd00d");
    }
  });
});
