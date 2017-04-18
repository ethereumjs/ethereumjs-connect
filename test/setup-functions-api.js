/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var clone = require("clone");
var ethcon = require("../src");

describe("setupFunctionsAPI", function () {
  var test = function (t) {
    it(t.description, function () {
      ethcon.state = clone(t.state);
      ethcon.setupFunctionsAPI();
      t.assertions(ethcon.state);
      ethcon.resetState();
    });
  };
  test({
    description: "set up functions API, do not modify null events API",
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: {
        contract1: "0xc1",
        contract2: "0xc2"
      },
      allContracts: {
        3: {
          contract1: "0xc1",
          contract2: "0xc2"
        }
      },
      api: {
        events: null,
        functions: {
          contract1: { method1: {}, method2: {} },
          contract2: { method1: {} }
        }
      },
      connection: { http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null }
    },
    assertions: function (state) {
      assert.isNull(state.api.events);
      assert.deepEqual(state.api.functions, {
        contract1: { method1: { to: "0xc1" }, method2: { to: "0xc1" } },
        contract2: { method1: { to: "0xc2" } }
      });
    }
  });
  test({
    description: "modify existing functions API, do not modify null events API",
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: {
        contract1: "0xc1",
        contract2: "0xc2"
      },
      allContracts: {
        3: {
          contract1: "0xc1",
          contract2: "0xc2"
        }
      },
      api: {
        events: null,
        functions: {
          contract1: { method1: { to: "0xC1" }, method2: { to: "0xC1" } },
          contract2: { method1: { to: "0xC2" } }
        }
      },
      connection: { http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null }
    },
    assertions: function (state) {
      assert.isNull(state.api.events);
      assert.deepEqual(state.api.functions, {
        contract1: { method1: { to: "0xc1" }, method2: { to: "0xc1" } },
        contract2: { method1: { to: "0xc2" } }
      });
    }
  });
  test({
    description: "modify existing functions API, do not modify existing events API",
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: {
        contract1: "0xc1",
        contract2: "0xc2"
      },
      allContracts: {
        3: {
          contract1: "0xc1",
          contract2: "0xc2"
        }
      },
      api: {
        events: {
          event1: { address: "0xC1", contract: "contract1" },
          event2: { address: "0xC1", contract: "contract1" },
          event3: { address: "0xC2", contract: "contract2" }
        },
        functions: {
          contract1: { method1: { to: "0xC1" }, method2: { to: "0xC1" } },
          contract2: { method1: { to: "0xC2" } }
        }
      },
      connection: { http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null }
    },
    assertions: function (state) {
      assert.deepEqual(state.api.events, {
        event1: { address: "0xC1", contract: "contract1" },
        event2: { address: "0xC1", contract: "contract1" },
        event3: { address: "0xC2", contract: "contract2" }
      });
      assert.deepEqual(state.api.functions, {
        contract1: { method1: { to: "0xc1" }, method2: { to: "0xc1" } },
        contract2: { method1: { to: "0xc2" } }
      });
    }
  });
});
