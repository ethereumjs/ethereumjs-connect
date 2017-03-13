/**
 * ethereumjs-connect unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("chai").assert;
var clone = require("clone");
var ethcon = require("../");
var StubServer = require("ethereumjs-stub-rpc-server");
var os = require("os");

describe("resetState", function () {
  var test = function (t) {
    it(t.description, function () {
      ethcon.state = clone(t.state);
      ethcon.resetState();
      t.assertions(ethcon.state);
    });
  };
  test({
    description: "initial null state values remain null",
    state: {
      from: null,
      coinbase: null,
      networkID: null,
      contracts: null,
      allContracts: null,
      api: { events: null, functions: null },
      connection: null
    },
    assertions: function (state) {
      assert.deepEqual(state, {
        from: null,
        coinbase: null,
        networkID: null,
        contracts: null,
        allContracts: null,
        api: { events: null, functions: null },
        connection: false
      });
    }
  });
  test({
    description: "set internal state values to null",
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
      assert.deepEqual(state, {
        from: null,
        coinbase: null,
        networkID: null,
        contracts: null,
        allContracts: null,
        api: { events: null, functions: null },
        connection: false
      });
    }
  });
});

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

describe("retryConnect", function () {
  var test = function (t) {
    var connect = ethcon.connect;
    after(function () {
      ethcon.connect = connect;
    });
    it(t.description, function (done) {
      ethcon.connect = function (options, callback) {
        var connection = {
          http: options.http,
          ws: options.ws,
          ipc: options.ipc
        };
        if (!callback) return connection;
        callback(connection);
      };
      ethcon.retryConnect(null, t.params.options, function (connection) {
        t.assertions(connection);
        ethcon.resetState();
        done();
      });
    });
  };
  test({
    description: "first retry: call connect",
    params: {
      options: {
        http: "http://127.0.0.1:8545",
        ws: "ws://127.0.0.1:8546",
        ipc: null
      }
    },
    assertions: function (connection) {
      assert.deepEqual(connection, {
        http: "http://127.0.0.1:8545",
        ws: "ws://127.0.0.1:8546",
        ipc: null
      });
    }
  });
  test({
    description: "second retry: fail",
    params: {
      options: {
        attempts: 1,
        http: "http://127.0.0.1:8545",
        ws: "ws://127.0.0.1:8546",
        ipc: null
      }
    },
    assertions: function (connection) {
      assert.isFalse(connection);
    }
  });
});

describe("configure", function () {
  beforeEach(function () {
    ethcon.resetState();
  });
  var test = function (testData) {
    it(testData.description, function () {
      ethcon.configure(testData.options);
      assert.deepEqual(ethcon.state, testData.expectedState);
    });
  };
  test({
    description: "http-only without api",
    options: {
      http: "http://somewhere:1234",
      ws: null,
      ipc: null,
      api: { events: null, functions: null },
      contracts: { 3: { contract1: "0xc1", contract2: "0xc2" } },
      noFallback: false
    },
    expectedState: {
      allContracts: { 3: { contract1: "0xc1", contract2: "0xc2" } },
      api: { events: null, functions: null },
      coinbase: null,
      connection: false,
      contracts: null,
      from: null,
      networkID: null
    }
  });
  test({
    description: "http-only with api",
    options: {
      http: "http://127.0.0.1:8545",
      ws: null,
      ipc: null,
      api: {
        events: {
          event1: { contract: "contract1" },
          event2: { contract: "contract1" },
          event3: { contract: "contract2" }
        },
        functions: {
          contract1: { method1: {}, method2: {} },
          contract2: { method1: {} }
        }
      },
      contracts: { 3: { contract1: "0xc1", contract2: "0xc2" } },
      noFallback: false
    },
    expectedState: {
      allContracts: { 3: { contract1: "0xc1", contract2: "0xc2" } },
      api: {
        events: {
          event1: { contract: "contract1" },
          event2: { contract: "contract1" },
          event3: { contract: "contract2" }
        },
        functions: {
          contract1: { method1: {}, method2: {} },
          contract2: { method1: {} }
        }
      },
      coinbase: null,
      connection: false,
      contracts: null,
      from: null,
      networkID: null
    }
  });
  test({
    description: "http and websockets with api",
    options: {
      http: "http://127.0.0.1:8545",
      ws: "ws://127.0.0.1:8546",
      ipc: null,
      api: {
        events: {
          event1: { contract: "contract1" },
          event2: { contract: "contract1" },
          event3: { contract: "contract2" }
        },
        functions: {
          contract1: { method1: {}, method2: {} },
          contract2: { method1: {} }
        }
      },
      contracts: { 3: { contract1: "0xc1", contract2: "0xc2" } },
      noFallback: false
    },
    expectedState: {
      allContracts: { 3: { contract1: "0xc1", contract2: "0xc2" } },
      api: {
        events: {
          event1: { contract: "contract1" },
          event2: { contract: "contract1" },
          event3: { contract: "contract2" }
        },
        functions: {
          contract1: { method1: {}, method2: {} },
          contract2: { method1: {} }
        }
      },
      coinbase: null,
      connection: false,
      contracts: null,
      from: null,
      networkID: null
    }
  });
  test({
    description: "http, websockets, and ipc with api",
    options: {
      http: "http://127.0.0.1:8545",
      ws: "ws://127.0.0.1:8546",
      ipc: "/home/jack/.ethereum/geth.ipc",
      api: {
        events: {
          event1: { contract: "contract1" },
          event2: { contract: "contract1" },
          event3: { contract: "contract2" }
        },
        functions: {
          contract1: { method1: {}, method2: {} },
          contract2: { method1: {} }
        }
      },
      contracts: { 3: { contract1: "0xc1", contract2: "0xc2" } },
      noFallback: false
    },
    expectedState: {
      allContracts: { 3: { contract1: "0xc1", contract2: "0xc2" } },
      api: {
        events: {
          event1: { contract: "contract1" },
          event2: { contract: "contract1" },
          event3: { contract: "contract2" }
        },
        functions: {
          contract1: { method1: {}, method2: {} },
          contract2: { method1: {} }
        }
      },
      coinbase: null,
      connection: false,
      contracts: null,
      from: null,
      networkID: null
    }
  });
  test({
    description: "second pass with fallback",
    options: {
      attempts: 1,
      http: "http://127.0.0.1:8545",
      ws: "ws://127.0.0.1:8546",
      ipc: "/home/jack/.ethereum/geth.ipc",
      api: {
        events: {
          event1: { contract: "contract1" },
          event2: { contract: "contract1" },
          event3: { contract: "contract2" }
        },
        functions: {
          contract1: { method1: {}, method2: {} },
          contract2: { method1: {} }
        }
      },
      contracts: { 3: { contract1: "0xc1", contract2: "0xc2" } },
      noFallback: false
    },
    expectedState: {
      allContracts: { 3: { contract1: "0xc1", contract2: "0xc2" } },
      api: {
        events: {
          event1: { contract: "contract1" },
          event2: { contract: "contract1" },
          event3: { contract: "contract2" }
        },
        functions: {
          contract1: { method1: {}, method2: {} },
          contract2: { method1: {} }
        }
      },
      coinbase: null,
      connection: false,
      contracts: null,
      from: null,
      networkID: null
    }
  });
  test({
    description: "second pass without fallback",
    options: {
      attempts: 1,
      http: "http://127.0.0.1:8545",
      ws: "ws://127.0.0.1:8546",
      ipc: "/home/jack/.ethereum/geth.ipc",
      api: {
        events: {
          event1: { contract: "contract1" },
          event2: { contract: "contract1" },
          event3: { contract: "contract2" }
        },
        functions: {
          contract1: { method1: {}, method2: {} },
          contract2: { method1: {} }
        }
      },
      contracts: { 3: { contract1: "0xc1", contract2: "0xc2" } },
      noFallback: true
    },
    expectedState: {
      allContracts: { 3: { contract1: "0xc1", contract2: "0xc2" } },
      api: {
        events: {
          event1: { contract: "contract1" },
          event2: { contract: "contract1" },
          event3: { contract: "contract2" }
        },
        functions: {
          contract1: { method1: {}, method2: {} },
          contract2: { method1: {} }
        }
      },
      coinbase: null,
      connection: false,
      contracts: null,
      from: null,
      networkID: null
    }
  });
});

describe("connect", function () {
  var test = function (t) {
    var syncConnect = ethcon.syncConnect;
    var asyncConnect = ethcon.asyncConnect;
    after(function () {
      ethcon.syncConnect = syncConnect;
      ethcon.asyncConnect = asyncConnect;
    });
    describe(t.description, function () {
      it("sync", function () {
        ethcon.syncConnect = function (options) {
          return {
            http: options.http,
            ws: options.ws,
            ipc: options.ipc
          };
        };
        t.assertions(ethcon.connect(t.params.options));
        ethcon.resetState();
      });
      it("async", function (done) {
        ethcon.asyncConnect = function (options, callback) {
          callback({
            http: options.http,
            ws: options.ws,
            ipc: options.ipc
          });
        };
        ethcon.connect(t.params.options, function (connection) {
          t.assertions(connection);
          ethcon.resetState();
          done();
        });
      });
    });
  };
  test({
    description: "no endpoints specified",
    params: {
      options: {
        contracts: {}
      }
    },
    assertions: function (connection) {
      assert.deepEqual(connection, {
        http: undefined,
        ws: undefined,
        ipc: undefined
      });
    }
  });
  test({
    description: "http only",
    params: {
      options: {
        http: "http://127.0.0.1:8545",
        ws: null,
        ipc: null,
        contracts: {}
      }
    },
    assertions: function (connection) {
      assert.deepEqual(connection, {
        http: "http://127.0.0.1:8545",
        ws: null,
        ipc: null
      });
    }
  });
  test({
    description: "http and websockets",
    params: {
      options: {
        http: "http://127.0.0.1:8545",
        ws: "ws://127.0.0.1:8546",
        ipc: null,
        contracts: {}
      }
    },
    assertions: function (connection) {
      assert.deepEqual(connection, {
        http: "http://127.0.0.1:8545",
        ws: "ws://127.0.0.1:8546",
        ipc: null
      });
    }
  });
  test({
    description: "http and ipc",
    params: {
      options: {
        http: "http://127.0.0.1:8545",
        ws: null,
        ipc: "/home/jack/.ethereum/geth.ipc",
        contracts: {}
      }
    },
    assertions: function (connection) {
      assert.deepEqual(connection, {
        http: "http://127.0.0.1:8545",
        ws: null,
        ipc: "/home/jack/.ethereum/geth.ipc"
      });
    }
  });
  test({
    description: "http, websockets, and ipc",
    params: {
      options: {
        http: "http://127.0.0.1:8545",
        ws: "ws://127.0.0.1:8546",
        ipc: "/home/jack/.ethereum/geth.ipc",
        contracts: {}
      }
    },
    assertions: function (connection) {
      assert.deepEqual(connection, {
        http: "http://127.0.0.1:8545",
        ws: "ws://127.0.0.1:8546",
        ipc: "/home/jack/.ethereum/geth.ipc"
      });
    }
  });
});

function connectTest(transportType, transportAddress) {
  /** @type {StubServer.AbstractServer} */
  var server;
  beforeEach(function () {
    server = new StubServer.createStubServer(transportType, transportAddress);
    ethcon.resetState();
  });
  afterEach(function (done) {
    server.destroy(done);
  });

  it("connects with array options", function (done) {
    var connectOptions = {
      contracts: {},
      api: {},
    };
    switch (transportType) {
      case "HTTP":
        connectOptions.httpAddresses = [transportAddress];
        break;
      case "WS":
        connectOptions.wsAddresses = [transportAddress];
        break;
      case "IPC":
        connectOptions.ipcAddresses = [transportAddress];
        break;
      default:
        throw new Error("Unknown transport type: " + transportType);
    }
    server.addResponder(function (jso) { if (jso.method === "eth_coinbase") return "0x123456789abcdef123456789abcdef"; });
    server.addResponder(function (jso) { if (jso.method === "eth_gasPrice") return "0x123"; });
    server.addResponder(function (jso) { if (jso.method === "net_version") return "apple"; });
    ethcon.connect(connectOptions, function (connected) {
      assert.isTrue(connected);
      assert.deepEqual(ethcon.state, {
        from: "0x123456789abcdef123456789abcdef",
        coinbase: "0x123456789abcdef123456789abcdef",
        networkID: "apple",
        contracts: {},
        allContracts: {},
        api: {},
        connection: true
      });
      done();
    });
  });

  var test = function (testData) {
    it("async " + testData.description, function (done) {
      server.addResponder(function (jso) { if (jso.method === "eth_coinbase") return testData.blockchain.coinbase; });
      server.addResponder(function (jso) { if (jso.method === "eth_gasPrice") return testData.blockchain.gasPrice; });
      server.addResponder(function (jso) { if (jso.method === "net_version") return testData.blockchain.networkID; });
      var connectOptions = {
        http: (transportType === "HTTP") ? transportAddress : undefined,
        ws: (transportType === "WS") ? transportAddress : undefined,
        ipc: (transportType === "IPC") ? transportAddress : undefined,
        contracts: testData.contracts,
        api: testData.api,
      };
      ethcon.connect(connectOptions, function (connected) {
        assert.isTrue(connected);
        assert.deepEqual(ethcon.state, testData.expectedState);
        assert.isNotNull(ethcon.rpc.block);
        done();
      });
    });
  };
  test({
    description: "asynchronous connection sequence without api",
    blockchain: {
      coinbase: "0xb0b",
      gasPrice: "0x4a817c801",
      networkID: "3"
    },
    contracts: {
      3: {
        contract1: "0xc1",
        contract2: "0xc2"
      }
    },
    expectedState: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: { contract1: "0xc1", contract2: "0xc2" },
      allContracts: { 3: { contract1: "0xc1", contract2: "0xc2" } },
      api: { events: null, functions: null },
      connection: true
    }
  });
  test({
    description: "asynchronous connection sequence with api",
    blockchain: {
      coinbase: "0xb0b",
      gasPrice: "0x4a817c801",
      networkID: "3"
    },
    contracts: {
      3: { contract1: "0xc1", contract2: "0xc2" }
    },
    api: {
      events: {
        event1: { contract: "contract1" },
        event2: { contract: "contract1" },
        event3: { contract: "contract2" }
      },
      functions: {
        contract1: { method1: {}, method2: {} },
        contract2: { method1: {} }
      }
    },
    expectedState: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: { contract1: "0xc1", contract2: "0xc2" },
      allContracts: {
        3: { contract1: "0xc1", contract2: "0xc2" }
      },
      api: {
        events: {
          event1: { address: "0xc1", contract: "contract1" },
          event2: { address: "0xc1", contract: "contract1" },
          event3: { address: "0xc2", contract: "contract2" }
        },
        functions: {
          contract1: { method1: { from: "0xb0b", to: "0xc1" }, method2: { from: "0xb0b", to: "0xc1" } },
          contract2: { method1: { from: "0xb0b", to: "0xc2" } }
        }
      },
      connection: true
    }
  });
}

describe("async connect", function () {
  describe("HTTP", connectTest.bind(null, "HTTP", "http://localhost:1337"));
  describe("WS", connectTest.bind(null, "WS", "ws://localhost:1337"));
  describe("IPC", connectTest.bind(null, "IPC", (os.type() === "Windows_NT") ? "\\\\.\\pipe\\TestRPC" : "testrpc.ipc"));
});

describe("sync connect", function () {
  beforeEach(function () {
    ethcon.resetState();
  });

  it("sync connection sequence with api", function () {
    this.timeout(10000);

    var expectedState = {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: { contract1: "0xc1", contract2: "0xc2" },
      allContracts: {
        3: { contract1: "0xc1", contract2: "0xc2" }
      },
      api: {
        events: {
          event1: { address: "0xc1", contract: "contract1" },
          event2: { address: "0xc1", contract: "contract1" },
          event3: { address: "0xc2", contract: "contract2" }
        },
        functions: {
          contract1: { method1: { from: "0xb0b", to: "0xc1" }, method2: { from: "0xb0b", to: "0xc1" } },
          contract2: { method1: { from: "0xb0b", to: "0xc2" } }
        }
      },
      connection: true
    };

    var connectOptions = {
      http: "https://eth3.augur.net",
      contracts: { 3: { contract1: "0xc1", contract2: "0xc2" } },
      api: {
        events: {
          event1: { contract: "contract1" },
          event2: { contract: "contract1" },
          event3: { contract: "contract2" }
        },
        functions: {
          contract1: { method1: {}, method2: {} },
          contract2: { method1: {} }
        }
      },
      noFallback: true,
    };

    var connected = ethcon.connect(connectOptions);
    assert.isTrue(connected);
    // since this is running against a real blockchain, some of the things don't test well
    assert.match(ethcon.state.api.functions.contract1.method1.from, /^0x[0-9a-zA-Z]{40}$/);
    ethcon.state.api.functions.contract1.method1.from = "0xb0b";
    assert.match(ethcon.state.api.functions.contract1.method2.from, /^0x[0-9a-zA-Z]{40}$/);
    ethcon.state.api.functions.contract1.method2.from = "0xb0b";
    assert.match(ethcon.state.api.functions.contract2.method1.from, /^0x[0-9a-zA-Z]{40}$/);
    ethcon.state.api.functions.contract2.method1.from = "0xb0b";
    assert.match(ethcon.state.coinbase, /^0x[0-9a-zA-Z]{40}$/);
    ethcon.state.coinbase = "0xb0b";
    assert.match(ethcon.state.from, /^0x[0-9a-zA-Z]{40}$/);
    ethcon.state.from = "0xb0b";

    assert.deepEqual(ethcon.state, expectedState);
    assert.isNotNull(ethcon.rpc.block);
  });
});