/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var setupFunctionsAPI = require("../src/setup-functions-api");

describe("setup-functions-api", function () {
  var test = function (t) {
    it(t.description, function () {
      t.assertions(setupFunctionsAPI(t.params.functionsAPI, t.params.contracts));
    });
  };
  test({
    description: "set up functions API",
    params: {
      functionsAPI: {
        contract1: { method1: {}, method2: {} },
        contract2: { method1: {} }
      },
      contracts: {
        contract1: "0xc1",
        contract2: "0xc2"
      }
    },
    assertions: function (functionsAPI) {
      assert.deepEqual(functionsAPI, {
        contract1: { method1: { to: "0xc1" }, method2: { to: "0xc1" } },
        contract2: { method1: { to: "0xc2" } }
      });
    }
  });
  test({
    description: "modify existing functions API",
    params: {
      functionsAPI: {
        contract1: { method1: { to: "0xC1" }, method2: { to: "0xC1" } },
        contract2: { method1: { to: "0xC2" } }
      },
      contracts: {
        contract1: "0xc1",
        contract2: "0xc2"
      }
    },
    assertions: function (functionsAPI) {
      assert.deepEqual(functionsAPI, {
        contract1: { method1: { to: "0xc1" }, method2: { to: "0xc1" } },
        contract2: { method1: { to: "0xc2" } }
      });
    }
  });
  test({
    description: "do not update functions API if contracts not provided",
    params: {
      functionsAPI: {
        contract1: { method1: { from: "0xb0b", to: "0xc1" }, method2: { from: "0xb0b", to: "0xc1" } },
        contract2: { method1: { from: "0xb0b", to: "0xc2" } }
      },
      contracts: null
    },
    assertions: function (functionsAPI) {
      assert.deepEqual(functionsAPI, {
        contract1: { method1: { from: "0xb0b", to: "0xc1" }, method2: { from: "0xb0b", to: "0xc1" } },
        contract2: { method1: { from: "0xb0b", to: "0xc2" } }
      });
    }
  });
  test({
    description: "do nothing if no functions API provided",
    params: {
      functionsAPI: null,
      contracts: "0xb0b"
    },
    assertions: function (functionsAPI) {
      assert.isNull(functionsAPI);
    }
  });
});
