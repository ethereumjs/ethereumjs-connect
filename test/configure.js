/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var ethcon = require("../src");

describe("configure", function () {
  beforeEach(function () {
    ethcon.resetState();
  });
  function test(testData) {
    it(testData.description, function () {
      ethcon.configure(testData.options);
      assert.deepEqual(ethcon.state, testData.expectedState);
    });
  }
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
