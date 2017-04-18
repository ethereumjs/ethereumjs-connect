/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var clone = require("clone");
var ethcon = require("../src");

describe("setFrom", function () {
  var test = function (t) {
    it(t.description, function () {
      ethcon.state = clone(t.state);
      ethcon.setFrom(t.params.account);
      t.assertions(ethcon.state);
      ethcon.resetState();
    });
  };
  test({
    description: "set from fields in functions API",
    params: {
      account: undefined
    },
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
          contract1: { method1: { to: "0xc1" }, method2: { to: "0xc1" } },
          contract2: { method1: { to: "0xc2" } }
        }
      },
      connection: { http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null }
    },
    assertions: function (state) {
      assert.strictEqual(state.from, "0xb0b");
      assert.deepEqual(state.api.functions, {
        contract1: { method1: { from: "0xb0b", to: "0xc1" }, method2: { from: "0xb0b", to: "0xc1" } },
        contract2: { method1: { from: "0xb0b", to: "0xc2" } }
      });
    }
  });
  test({
    description: "set from fields in functions API using account parameter",
    params: {
      account: "0xb0b"
    },
    state: {
      from: "0xd00d",
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
          contract1: { method1: { to: "0xc1" }, method2: { to: "0xc1" } },
          contract2: { method1: { to: "0xc2" } }
        }
      },
      connection: { http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null }
    },
    assertions: function (state) {
      assert.strictEqual(state.from, "0xd00d");
      assert.deepEqual(state.api.functions, {
        contract1: { method1: { from: "0xb0b", to: "0xc1" }, method2: { from: "0xb0b", to: "0xc1" } },
        contract2: { method1: { from: "0xb0b", to: "0xc2" } }
      });
    }
  });
  test({
    description: "change from fields in functions API",
    params: {
      account: undefined
    },
    state: {
      from: "0xd00d",
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
          contract1: { method1: { from: "0xb0b", to: "0xc1" }, method2: { from: "0xb0b", to: "0xc1" } },
          contract2: { method1: { from: "0xb0b", to: "0xc2" } }
        }
      },
      connection: { http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null }
    },
    assertions: function (state) {
      assert.strictEqual(state.from, "0xd00d");
      assert.deepEqual(state.api.functions, {
        contract1: { method1: { from: "0xd00d", to: "0xc1" }, method2: { from: "0xd00d", to: "0xc1" } },
        contract2: { method1: { from: "0xd00d", to: "0xc2" } }
      });
    }
  });
  test({
    description: "change from fields in functions API using account parameter",
    params: {
      account: "0xd00d"
    },
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
          contract1: { method1: { to: "0xc1" }, method2: { to: "0xc1" } },
          contract2: { method1: { to: "0xc2" } }
        }
      },
      connection: { http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null }
    },
    assertions: function (state) {
      assert.strictEqual(state.from, "0xb0b");
      assert.deepEqual(state.api.functions, {
        contract1: { method1: { from: "0xd00d", to: "0xc1" }, method2: { from: "0xd00d", to: "0xc1" } },
        contract2: { method1: { from: "0xd00d", to: "0xc2" } }
      });
    }
  });
  test({
    description: "set state.from value and change from fields in functions API using account parameter",
    params: {
      account: "0xd00d"
    },
    state: {
      from: null,
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
          contract1: { method1: { to: "0xc1" }, method2: { to: "0xc1" } },
          contract2: { method1: { to: "0xc2" } }
        }
      },
      connection: { http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null }
    },
    assertions: function (state) {
      assert.strictEqual(state.from, "0xd00d");
      assert.deepEqual(state.api.functions, {
        contract1: { method1: { from: "0xd00d", to: "0xc1" }, method2: { from: "0xd00d", to: "0xc1" } },
        contract2: { method1: { from: "0xd00d", to: "0xc2" } }
      });
    }
  });
});
