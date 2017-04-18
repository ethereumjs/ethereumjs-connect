/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var clone = require("clone");
var ethcon = require("../src");

describe("setNetworkID", function () {
  var test = function (t) {
    var version = ethcon.rpc.version;
    after(function () {
      ethcon.rpc.version = version;
    });
    describe(t.description, function () {
      it("sync", function () {
        ethcon.rpc.version = function (callback) {
          if (!callback) return t.blockchain.networkID;
          callback(t.blockchain.networkID);
        };
        ethcon.state = clone(t.state);
        try {
          ethcon.setNetworkID();
          t.assertions(null, ethcon.state);
        } catch (exc) {
          t.assertions(exc, ethcon.state);
        }
        ethcon.resetState();
      });
      it("async", function (done) {
        ethcon.rpc.version = function (callback) {
          if (!callback) return t.blockchain.networkID;
          callback(t.blockchain.networkID);
        };
        ethcon.state = clone(t.state);
        ethcon.setNetworkID(function (err) {
          t.assertions(err, ethcon.state);
          ethcon.resetState();
          done();
        });
      });
    });
  };
  test({
    description: "network ID unchanged",
    blockchain: {
      networkID: "3"
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
    assertions: function (err, state) {
      assert.isNull(err);
      assert.strictEqual(state.networkID, "3");
    }
  });
  test({
    description: "change network ID from 1 to 3",
    blockchain: {
      networkID: "3"
    },
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "1",
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
      assert.strictEqual(state.networkID, "3");
    }
  });
  test({
    description: "rpc.version returns null",
    blockchain: {
      networkID: null
    },
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "1",
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
      assert.strictEqual(err.message, "setNetworkID failed");
    }
  });
  test({
    description: "rpc.version returns an error",
    blockchain: {
      networkID: { error: "epic fail" }
    },
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "1",
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
