/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var ethcon = require("../src");
var StubServer = require("ethereumjs-stub-rpc-server");
var os = require("os");

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
      api: {}
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

  function test(testData) {
    it("async " + testData.description, function (done) {
      var connectOptions;
      server.addResponder(function (jso) { if (jso.method === "eth_coinbase") return testData.blockchain.coinbase; });
      server.addResponder(function (jso) { if (jso.method === "eth_gasPrice") return testData.blockchain.gasPrice; });
      server.addResponder(function (jso) { if (jso.method === "net_version") return testData.blockchain.networkID; });
      connectOptions = {
        http: (transportType === "HTTP") ? transportAddress : undefined,
        ws: (transportType === "WS") ? transportAddress : undefined,
        ipc: (transportType === "IPC") ? transportAddress : undefined,
        contracts: testData.contracts,
        api: testData.api
      };
      ethcon.connect(connectOptions, function (connected) {
        assert.isTrue(connected);
        assert.deepEqual(ethcon.state, testData.expectedState);
        assert.isNotNull(ethcon.rpc.block);
        done();
      });
    });
  }
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
    var expectedState, connectOptions, connected;
    this.timeout(10000);
    expectedState = {
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

    connectOptions = {
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
      noFallback: true
    };

    connected = ethcon.connect(connectOptions);
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
