/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var setupFunctionsABI = require("../src/setup-functions-abi");

describe("setup-functions-abi", function () {
  var test = function (t) {
    it(t.description, function () {
      t.assertions(setupFunctionsABI(t.params.functionsABI, t.params.contracts));
    });
  };
  test({
    description: "set up functions ABI",
    params: {
      functionsABI: {
        contract1: { method1: {}, method2: {} },
        contract2: { method1: {} }
      },
      contracts: {
        contract1: "0xc1",
        contract2: "0xc2"
      }
    },
    assertions: function (functionsABI) {
      assert.deepEqual(functionsABI, {
        contract1: { method1: { to: "0xc1" }, method2: { to: "0xc1" } },
        contract2: { method1: { to: "0xc2" } }
      });
    }
  });
  test({
    description: "modify existing functions ABI",
    params: {
      functionsABI: {
        contract1: { method1: { to: "0xC1" }, method2: { to: "0xC1" } },
        contract2: { method1: { to: "0xC2" } }
      },
      contracts: {
        contract1: "0xc1",
        contract2: "0xc2"
      }
    },
    assertions: function (functionsABI) {
      assert.deepEqual(functionsABI, {
        contract1: { method1: { to: "0xc1" }, method2: { to: "0xc1" } },
        contract2: { method1: { to: "0xc2" } }
      });
    }
  });
  test({
    description: "do not update functions ABI if contracts not provided",
    params: {
      functionsABI: {
        contract1: { method1: { from: "0xb0b", to: "0xc1" }, method2: { from: "0xb0b", to: "0xc1" } },
        contract2: { method1: { from: "0xb0b", to: "0xc2" } }
      },
      contracts: null
    },
    assertions: function (functionsABI) {
      assert.deepEqual(functionsABI, {
        contract1: { method1: { from: "0xb0b", to: "0xc1" }, method2: { from: "0xb0b", to: "0xc1" } },
        contract2: { method1: { from: "0xb0b", to: "0xc2" } }
      });
    }
  });
  test({
    description: "do nothing if no functions ABI provided",
    params: {
      functionsABI: null,
      contracts: "0xb0b"
    },
    assertions: function (functionsABI) {
      assert.isNull(functionsABI);
    }
  });
});
