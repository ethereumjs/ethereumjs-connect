/**
 * ethereumjs-connect unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("chai").assert;
var clone = require("clone");
var ethcon = require("../");
ethcon.debug = true;

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
      initialContracts: null,
      api: {events: null, functions: null},
      connection: null
    },
    assertions: function (state) {
      assert.deepEqual(state, {
        from: null,
        coinbase: null,
        networkID: null,
        contracts: null,
        allContracts: null,
        initialContracts: null,
        api: {events: null, functions: null},
        connection: null
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
        1: {myContract: "0xc1"},
        3: {myContract: "0xc3"}
      },
      initialContracts: null,
      api: {events: null, functions: null},
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.deepEqual(state, {
        from: null,
        coinbase: null,
        networkID: null,
        contracts: null,
        allContracts: null,
        initialContracts: null,
        api: {events: null, functions: null},
        connection: null
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
        1: {myContract: "0xc1"},
        3: {myContract: "0xc3"}
      },
      initialContracts: null,
      api: {events: null, functions: null},
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
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
      contracts: {myContract: "0xc1"},
      allContracts: {
        1: {myContract: "0xc1"},
        3: {myContract: "0xc3"}
      },
      initialContracts: null,
      api: {events: null, functions: null},
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
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
      initialContracts: null,
      api: {
        events: null,
        functions: {
          contract1: {method1: {}, method2: {}},
          contract2: {method1: {}}
        }
      },
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.isNull(state.api.events);
      assert.deepEqual(state.api.functions, {
        contract1: {method1: {to: "0xc1"}, method2: {to: "0xc1"}},
        contract2: {method1: {to: "0xc2"}}
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
      initialContracts: null,
      api: {
        events: null,
        functions: {
          contract1: {method1: {to: "0xC1"}, method2: {to: "0xC1"}},
          contract2: {method1: {to: "0xC2"}}
        }
      },
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.isNull(state.api.events);
      assert.deepEqual(state.api.functions, {
        contract1: {method1: {to: "0xc1"}, method2: {to: "0xc1"}},
        contract2: {method1: {to: "0xc2"}}
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
      initialContracts: null,
      api: {
        events: {
          event1: {address: "0xC1", contract: "contract1"},
          event2: {address: "0xC1", contract: "contract1"},
          event3: {address: "0xC2", contract: "contract2"}
        },
        functions: {
          contract1: {method1: {to: "0xC1"}, method2: {to: "0xC1"}},
          contract2: {method1: {to: "0xC2"}}
        }
      },
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.deepEqual(state.api.events, {
        event1: {address: "0xC1", contract: "contract1"},
        event2: {address: "0xC1", contract: "contract1"},
        event3: {address: "0xC2", contract: "contract2"}
      });
      assert.deepEqual(state.api.functions, {
        contract1: {method1: {to: "0xc1"}, method2: {to: "0xc1"}},
        contract2: {method1: {to: "0xc2"}}
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
      initialContracts: null,
      api: {
        events: {
          event1: {contract: "contract1"},
          event2: {contract: "contract1"},
          event3: {contract: "contract2"}
        },
        functions: null
      },
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.deepEqual(state.api.events, {
        event1: {address: "0xc1", contract: "contract1"},
        event2: {address: "0xc1", contract: "contract1"},
        event3: {address: "0xc2", contract: "contract2"}
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
      initialContracts: null,
      api: {
        events: {
          event1: {address: "0xC1", contract: "contract1"},
          event2: {address: "0xC1", contract: "contract1"},
          event3: {address: "0xC2", contract: "contract2"}
        },
        functions: null
      },
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.deepEqual(state.api.events, {
        event1: {address: "0xc1", contract: "contract1"},
        event2: {address: "0xc1", contract: "contract1"},
        event3: {address: "0xc2", contract: "contract2"}
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
      initialContracts: null,
      api: {
        events: {
          event1: {address: "0xC1", contract: "contract1"},
          event2: {address: "0xC1", contract: "contract1"},
          event3: {address: "0xC2", contract: "contract2"}
        },
        functions: {
          contract1: {method1: {to: "0xC1"}, method2: {to: "0xC1"}},
          contract2: {method1: {to: "0xC2"}}
        }
      },
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
    },
    assertions: function (state) {
      assert.deepEqual(state.api.events, {
        event1: {address: "0xc1", contract: "contract1"},
        event2: {address: "0xc1", contract: "contract1"},
        event3: {address: "0xc2", contract: "contract2"}
      });
      assert.deepEqual(state.api.functions, {
        contract1: {method1: {to: "0xC1"}, method2: {to: "0xC1"}},
        contract2: {method1: {to: "0xC2"}}
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
    it(t.description, function (done) {
      ethcon.state = clone(t.state);
      ethcon.rpc.getGasPrice = function (callback) {
        ethcon.rpc.gasPrice = t.blockchain.gasPrice;
        if (callback) callback(null);
      };
      ethcon.setGasPrice(function (err) {
        t.assertions(err, ethcon.rpc, ethcon.state);
        ethcon.resetState();
        done();
      });
    });
  };
  test({
    description: "set rpc.gasPrice to latest block value",
    blockchain: {
      gasPrice: 20000000001
    },
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: null,
      allContracts: {
        1: {myContract: "0xc1"},
        3: {myContract: "0xc3"}
      },
      initialContracts: null,
      api: {events: null, functions: null},
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
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
          1: {myContract: "0xc1"},
          3: {myContract: "0xc3"}
        },
        initialContracts: null,
        api: {events: null, functions: null},
        connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
      });
    }
  });
  test({
    description: "rpc.gasPrice the same as latest block value",
    blockchain: {
      gasPrice: 20000000000
    },
    state: {
      from: "0xb0b",
      coinbase: "0xb0b",
      networkID: "3",
      contracts: null,
      allContracts: {
        1: {myContract: "0xc1"},
        3: {myContract: "0xc3"}
      },
      initialContracts: null,
      api: {events: null, functions: null},
      connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
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
          1: {myContract: "0xc1"},
          3: {myContract: "0xc3"}
        },
        initialContracts: null,
        api: {events: null, functions: null},
        connection: {http: "http://127.0.0.1:8545", ws: "ws://127.0.0.1:8546", ipc: null}
      });
    }
  });
});
