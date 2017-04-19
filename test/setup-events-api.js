/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var setupEventsAPI = require("../src/setup-events-api")

describe("setup-events-api", function () {
  var test = function (t) {
    it(t.description, function () {
      t.assertions(setupEventsAPI(t.params.eventsAPI, t.params.contracts));
    });
  };
  test({
    description: "set up events API",
    params: {
      eventsAPI: {
        event1: { contract: "contract1" },
        event2: { contract: "contract1" },
        event3: { contract: "contract2" }
      },
      contracts: {
        contract1: "0xc1",
        contract2: "0xc2"
      },
    },
    assertions: function (eventsAPI) {
      assert.deepEqual(eventsAPI, {
        event1: { address: "0xc1", contract: "contract1" },
        event2: { address: "0xc1", contract: "contract1" },
        event3: { address: "0xc2", contract: "contract2" }
      });
    }
  });
  test({
    description: "modify existing events API",
    params: {
      eventsAPI: {
        event1: { address: "0xC1", contract: "contract1" },
        event2: { address: "0xC1", contract: "contract1" },
        event3: { address: "0xC2", contract: "contract2" }
      },
      contracts: {
        contract1: "0xc1",
        contract2: "0xc2"
      }
    },
    assertions: function (eventsAPI) {
      assert.deepEqual(eventsAPI, {
        event1: { address: "0xc1", contract: "contract1" },
        event2: { address: "0xc1", contract: "contract1" },
        event3: { address: "0xc2", contract: "contract2" }
      });
    }
  });
});
