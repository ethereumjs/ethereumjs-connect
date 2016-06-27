/**
 * ethereumjs-connect unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var join = require("path").join;
var assert = require("chai").assert;
var connector = require("../");
connector.debug = true;

var TIMEOUT = 48000;
var IPCPATH = process.env.GETH_IPC;

require('it-each')({testPerIteration: true});

var custom_contracts = {
    "buyAndSellShares": "0x1",
    "closeMarket": "0x2",
    "closeMarketEight": "0x3",
    "closeMarketFour": "0x4",
    "closeMarketOne": "0x5",
    "closeMarketTwo": "0x6",
    "collectFees": "0x7",
    "completeSets": "0x8",
    "compositeGetters": "0x9",
    "consensus": "0x10",
    "createBranch": "0x11",
    "createMarket": "0x12",
    "createSingleEventMarket": "0x13",
    "eventResolution": "0x14",
    "faucets": "0x15",
    "forkPenalize": "0x16",
    "forking": "0x17",
    "makeReports": "0x18",
    "penalizationCatchup": "0x19",
    "penalizeNotEnoughReports": "0x20",
    "roundTwo": "0x21",
    "roundTwoPenalize": "0x22",
    "sendReputation": "0x23",
    "slashRep": "0x24",
    "trade": "0x25",
    "backstops": "0x26",
    "branches": "0x27",
    "cash": "0x28",
    "consensusData": "0x29",
    "events": "0x30",
    "expiringEvents": "0x31",
    "fxpFunctions": "0x32",
    "info": "0x33",
    "markets": "0x34",
    "reporting": "0x35",
    "trades": "0x36"
};

describe("has_value", function () {

    var test = function (t) {
        it(JSON.stringify(t.object) + " has value " + t.value + " -> " + t.expected, function () {
            assert.strictEqual(connector.has_value(t.object, t.value), t.expected);
        });
    };

    test({
        object: {"augur": 42},
        value: 42,
        expected: "augur"
    });
    test({
        object: {"augur": 42},
        value: "augur",
        expected: undefined
    });
    test({
        object: {"augur": 42},
        value: 41,
        expected: undefined
    });
    test({
        object: {"augur": 42, "whee": "thereum"},
        value: "thereum",
        expected: "whee"
    });
    test({
        object: {"augur": 42, "whee": "thereum"},
        value: 42,
        expected: "augur"
    });
    test({
        object: {"augur": 42, "whee": "thereum"},
        value: "42",
        expected: undefined
    });
    test({
        object: {"augur": 42, "whee": "thereum"},
        value: "whee",
        expected: undefined
    });
    test({
        object: {"augur": 42, "whee": "thereum"},
        value: -42,
        expected: undefined
    });
    test({
        object: {"augur": 42, "whee": "thereum"},
        value: undefined,
        expected: undefined
    });
    test({
        object: {"augur": 42, "whee": "thereum"},
        value: null,
        expected: undefined
    });
    test({
        object: {"augur": null, "whee": "thereum"},
        value: null,
        expected: "augur"
    });
    test({
        object: {"augur": 42, "whee": "thereum"},
        value: "0x42",
        expected: undefined
    });
    test({
        object: {},
        value: null,
        expected: undefined
    });
    test({
        object: {},
        value: undefined,
        expected: undefined
    });
    test({
        object: {},
        value: 0,
        expected: undefined
    });
});

describe("connect", function () {

    describe("hosted node fallback", function () {
        var test = function (t) {
            it("[async] " + JSON.stringify(t), function (done) {
                this.timeout(TIMEOUT);
                delete require.cache[require.resolve("../")];
                var connector = require("../");
                connector.connect(t, function (connection) {
                    assert.deepEqual(connection, t.expected);
                    assert.strictEqual(connector.rpc.wsUrl, t.expected.ws);
                    assert.strictEqual(connector.rpc.ipcpath, t.expected.ipc);
                    done();
                });
            });
            it("[sync] " + JSON.stringify(t), function () {
                delete require.cache[require.resolve("../")];
                var connector = require("../");
                var connection = connector.connect(t);
                assert.deepEqual(connection.http, t.expected.http);
                if (t.expected.ws !== null) {
                    assert.strictEqual(connector.rpc.wsUrl, t.expected.ws);
                }
                if (t.expected.ipc !== null) {
                    assert.strictEqual(connector.rpc.ipcpath, t.expected.ipc);
                }
            });
        };
        test({
            http: "https://eth3.augur.net",
            ws: "wss://ws.augur.net",
            expected: {
                http: "https://eth3.augur.net",
                ws: "wss://ws.augur.net",
                ipc: null
            }
        });
        test({
            http: "https://eth3.augur.net",
            ws: "wss://lulz.augur.net",
            expected: {
                http: "https://eth3.augur.net",
                ws: null,
                ipc: null
            }
        });
        test({
            http: "https://lulz.augur.net",
            ws: null,
            expected: {
                http: ["https://eth3.augur.net"],
                ws: "wss://ws.augur.net",
                ipc: null
            }
        });
        test({
            http: "https://eth3.augur.net",
            ws: null,
            expected: {
                http: "https://eth3.augur.net",
                ws: null,
                ipc: null
            }
        });
        test({
            http: "https://lulz.augur.net",
            ws: "wss://ws.augur.net",
            expected: {
                http: ["https://eth3.augur.net"],
                ws: "wss://ws.augur.net",
                ipc: null
            }
        });
        test({
            http: "https://lulz.augur.net",
            ws: "wss://lulz.augur.net",
            expected: {
                http: ["https://eth3.augur.net"],
                ws: "wss://ws.augur.net",
                ipc: null
            }
        });
        test({
            http: "https://not.a.real.url",
            ws: "wss://not.a.real.url",
            expected: {
                http: ["https://eth3.augur.net"],
                ws: "wss://ws.augur.net",
                ipc: null
            }
        });
        test({
            http: "http://127.0.0.2:2121",
            ws: "ws://127.0.0.2:1212",
            expected: {
                http: ["https://eth3.augur.net"],
                ws: "wss://ws.augur.net",
                ipc: null
            }
        });
        if (process.env.INTEGRATION_TESTS) {
            test({
                http: "http://127.0.0.1:8545",
                ws: "ws://127.0.0.1:8546",
                expected: {
                    http: "http://127.0.0.1:8545",
                    ws: "ws://127.0.0.1:8546",
                    ipc: null
                }
            });
        }
    });

    describe("hosted nodes", function () {
        var test = function (t) {
            it("[sync] " + JSON.stringify(t.node), function () {
                this.timeout(TIMEOUT);
                delete require.cache[require.resolve("../")];
                var connector = require("../");
                var conn = connector.connect(t.node);
                assert.isObject(conn);
                assert.strictEqual(conn.http, t.node.http);
                assert.strictEqual(conn.ws, t.node.ws);
                assert.isNull(conn.ipc);
                assert.strictEqual(connector.coinbase, t.address);
            });
            it("[async] " + JSON.stringify(t.node), function () {
                this.timeout(TIMEOUT);
                delete require.cache[require.resolve("../")];
                var connector = require("../");
                connector.connect(t.node, function (conn) {
                    assert.isObject(conn);
                    assert.strictEqual(conn.http, t.node.http);
                    assert.strictEqual(conn.ws, t.node.ws);
                    assert.isNull(conn.ipc);
                    assert.strictEqual(connector.coinbase, t.address);
                });
            });
        };
        test({
            node: {http: "https://eth3.augur.net"},
            address: "0x00bae5113ee9f252cceb0001205b88fad175461a"
        });
        test({
            node: {http: "https://eth3.augur.net", ws: "wss://ws.augur.net"},
            address: "0x00bae5113ee9f252cceb0001205b88fad175461a"
        });
    });

    if (process.env.ETHEREUMJS_INTEGRATION_TESTS) {
        describe("local node", function () {
            var connectOptions = [
                {http: "http://localhost:8545"},
                {http: "http://127.0.0.1:8545"}
            ];
            it.each(connectOptions,
                "[sync] connect to",
                ["element"],
                function (element, next) {
                    this.timeout(TIMEOUT);
                    delete require.cache[require.resolve("../")];
                    var connector = require("../");
                    var conn = connector.connect(element);
                    assert.isObject(conn);
                    assert.strictEqual(conn.http, element.http);
                    assert.strictEqual(conn.ws, element.ws);
                    assert.strictEqual(conn.ipc, element.ipc);
                    assert.isTrue(connector.connected());
                    assert.isString(connector.coinbase);
                    next();
                }
            );
            it.each(connectOptions,
                "[sync] connect with custom contracts",
                ["element"],
                function (element, next) {
                    this.timeout(TIMEOUT);
                    delete require.cache[require.resolve("../")];
                    var connector = require("../");
                    var options = element;
                    options.contracts = custom_contracts;
                    var conn = connector.connect(options);
                    assert.isObject(conn);
                    assert.strictEqual(conn.http, element.http);
                    assert.strictEqual(conn.ws, element.ws);
                    assert.strictEqual(conn.ipc, element.ipc);
                    assert.isTrue(connector.connected());
                    assert.isString(connector.coinbase);
                    assert.deepEqual(connector.contracts, custom_contracts);
                    assert.deepEqual(connector.init_contracts, custom_contracts);
                    assert.deepEqual(connector.custom_contracts, custom_contracts);
                    next();
                }
            );
            it.each(connectOptions,
                "[sync] connect with IPC support",
                ["element"],
                function (element, next) {
                    this.timeout(TIMEOUT);
                    delete require.cache[require.resolve("../")];
                    var connector = require("../");
                    var options = element;
                    options.ipc = IPCPATH;
                    var conn = connector.connect(options);
                    assert.isObject(conn);
                    assert.strictEqual(conn.http, element.http);
                    assert.strictEqual(conn.ws, element.ws);
                    assert.strictEqual(conn.ipc, element.ipc);
                    assert.isTrue(connector.connected());
                    assert.isString(connector.coinbase);
                    next();
                }
            );
            it.each(connectOptions,
                "[async] connect to",
                ["element"],
                function (element, next) {
                    this.timeout(TIMEOUT);
                    delete require.cache[require.resolve("../")];
                    var connector = require("../");
                    connector.connect(element, function (conn) {
                        assert.isObject(conn);
                        assert.strictEqual(conn.http, element.http);
                        assert.strictEqual(conn.ws, element.ws);
                        assert.strictEqual(conn.ipc, element.ipc);
                        assert.isTrue(connector.connected());
                        assert.isString(connector.coinbase);
                        next();
                    });
                }
            );
            it.each(connectOptions,
                "[async] connect to",
                ["element"],
                function (element, next) {
                    this.timeout(TIMEOUT);
                    delete require.cache[require.resolve("../")];
                    var connector = require("../");
                    connector.connect(element, function (conn) {
                        assert.isObject(conn);
                        assert.strictEqual(conn.http, element.http);
                        assert.strictEqual(conn.ws, element.ws);
                        assert.strictEqual(conn.ipc, element.ipc);
                        assert.isTrue(connector.connected());
                        assert.isString(connector.coinbase);
                        next();
                    });
                }
            );
            it.each(connectOptions,
                "[async] connect with custom contracts",
                ["element"],
                function (element, next) {
                    this.timeout(TIMEOUT);
                    delete require.cache[require.resolve("../")];
                    var connector = require("../");
                    var options = element;
                    options.contracts = custom_contracts;
                    connector.connect(options, function (conn) {
                        assert.isObject(conn);
                        assert.strictEqual(conn.http, element.http);
                        assert.strictEqual(conn.ws, element.ws);
                        assert.strictEqual(conn.ipc, element.ipc);
                        assert.isTrue(connector.connected());
                        assert.isString(connector.coinbase);
                        assert.deepEqual(connector.contracts, custom_contracts);
                        assert.deepEqual(connector.init_contracts, custom_contracts);
                        assert.deepEqual(connector.custom_contracts, custom_contracts);
                        next();
                    });
                }
            );
            it.each(connectOptions,
                "[async] connect with IPC support",
                ["element"],
                function (element, next) {
                    this.timeout(TIMEOUT);
                    delete require.cache[require.resolve("../")];
                    var connector = require("../");
                    var options = element;
                    options.ipc = IPCPATH;
                    connector.connect(options, function (conn) {
                        assert.isObject(conn);
                        assert.strictEqual(conn.http, element.http);
                        assert.strictEqual(conn.ws, element.ws);
                        assert.strictEqual(conn.ipc, element.ipc);
                        assert.isTrue(connector.connected());
                        assert.isString(connector.coinbase);
                        next();
                    });
                }
            );
        });

        it("[sync] unlocked", function () {
            this.timeout(TIMEOUT);
            delete require.cache[require.resolve("../")];
            var connector = require("../");
            var conn = connector.connect({http: "http://localhost:8545"});
            assert.isNotNull(connector.rpc.nodes.local);
            assert.isTrue(connector.rpc.unlocked(connector.coinbase));
        });
        it("[async] unlocked", function (done) {
            this.timeout(TIMEOUT);
            delete require.cache[require.resolve("../")];
            var connector = require("../");
            connector.connect({http: "http://localhost:8545"}, function (conn) {
                connector.rpc.unlocked(connector.coinbase, function (unlocked) {
                    assert.isNotNull(connector.rpc.nodes.local);
                    assert.isTrue(unlocked);
                    done();
                });
            });
        });
    }

    it("[sync] unlocked", function () {
        this.timeout(TIMEOUT);
        delete require.cache[require.resolve("../")];
        var connector = require("../");
        var conn = connector.connect({http: "https://eth3.augur.net"});
        assert.isNotNull(connector.rpc.nodes.local);
        assert.isFalse(connector.rpc.unlocked(connector.coinbase));
    });
    it("[async] unlocked", function (done) {
        this.timeout(TIMEOUT);
        delete require.cache[require.resolve("../")];
        var connector = require("../");
        connector.connect({http: "https://eth3.augur.net"}, function (conn) {
            connector.rpc.unlocked(connector.coinbase, function (unlocked) {
                assert.isNotNull(connector.rpc.nodes.local);
                assert.isFalse(unlocked);
                done();
            });
        });
    });

    it("network_id = 0, 1, 2, 7, or 10101", function () {
        delete require.cache[require.resolve("../")];
        var connector = require("../");
        connector.connect();
        assert.include(["0", "1", "2", "7", "10101"], connector.network_id);
    });

});
