/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var clone = require("clone");
var ethcon = require("../src");

describe("setContracts", function () {
  var test = function (t) {
    it(t.description, function () {
      ethcon.state = clone(t.state);
      ethcon.setContracts();
      t.assertions(ethcon.state);
      ethcon.resetState();
    });
  };
  test({
    description: "set active contracts to network ID",
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
    assertions: function (state) {
      assert.deepEqual(state.contracts, state.allContracts[state.networkID]);
    }
  });
  test({
    description: "switch active contracts from network ID 1 to 3",
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: { myContract: "0xc1" },
      allContracts: {
        1: { myContract: "0xc1" },
        3: { myContract: "0xc3" }
      },
      api: { events: null, functions: null },
      connection: { http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null }
    },
    assertions: function (state) {
      assert.deepEqual(state.contracts, state.allContracts[state.networkID]);
    }
  });
});
