/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var clone = require("clone");
var ethcon = require("../src");

describe("setupEventsAPI", function () {
  var test = function (t) {
    it(t.description, function () {
      ethcon.state = clone(t.state);
      ethcon.setupEventsAPI();
      t.assertions(ethcon.state);
      ethcon.resetState();
    });
  };
  test({
    description: "set up events API, do not modify null functions API",
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
          event1: { contract: "contract1" },
          event2: { contract: "contract1" },
          event3: { contract: "contract2" }
        },
        functions: null
      },
      connection: { http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null }
    },
    assertions: function (state) {
      assert.deepEqual(state.api.events, {
        event1: { address: "0xc1", contract: "contract1" },
        event2: { address: "0xc1", contract: "contract1" },
        event3: { address: "0xc2", contract: "contract2" }
      });
      assert.isNull(state.api.functions);
    }
  });
  test({
    description: "modify existing events API, do not modify null functions API",
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
        functions: null
      },
      connection: { http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null }
    },
    assertions: function (state) {
      assert.deepEqual(state.api.events, {
        event1: { address: "0xc1", contract: "contract1" },
        event2: { address: "0xc1", contract: "contract1" },
        event3: { address: "0xc2", contract: "contract2" }
      });
      assert.isNull(state.api.functions);
    }
  });
  test({
    description: "modify existing events API, do not modify existing functions API",
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
        event1: { address: "0xc1", contract: "contract1" },
        event2: { address: "0xc1", contract: "contract1" },
        event3: { address: "0xc2", contract: "contract2" }
      });
      assert.deepEqual(state.api.functions, {
        contract1: { method1: { to: "0xC1" }, method2: { to: "0xC1" } },
        contract2: { method1: { to: "0xC2" } }
      });
    }
  });
});
