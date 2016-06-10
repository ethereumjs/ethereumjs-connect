/**
 * ethereumjs-connect unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var join = require("path").join;
var assert = require("chai").assert;
var contracts = require("augur-contracts");
var connector = require("../");
connector.debug = true;

var TIMEOUT = 48000;
var IPCPATH = process.env.GETH_IPC;

require('it-each')({ testPerIteration: true });

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

    // describe("hosted nodes", function () {
    //     var test = function (t) {
    //         it("[sync] " + JSON.stringify(t.node), function () {
    //             this.timeout(TIMEOUT);
    //             delete require.cache[require.resolve("../")];
    //             var connector = require("../");
    //             var conn = connector.connect(t.node);
    //             assert.isObject(conn);
    //             assert.strictEqual(conn.http, t.node.http);
    //             assert.strictEqual(conn.ws, t.node.ws);
    //             assert.isUndefined(conn.ipc);
    //             assert.strictEqual(connector.coinbase, t.address);
    //         });
    //         it("[async] " + JSON.stringify(t.node), function () {
    //             this.timeout(TIMEOUT);
    //             delete require.cache[require.resolve("../")];
    //             var connector = require("../");
    //             connector.connect(t.node, function (conn) {
    //                 assert.isObject(conn);
    //                 assert.strictEqual(conn.http, t.node.http);
    //                 assert.strictEqual(conn.ws, t.node.ws);
    //                 assert.isUndefined(conn.ipc);
    //                 assert.strictEqual(connector.coinbase, t.address);
    //             });
    //         });
    //     };
    //     test({
    //         node: {http: "https://eth3.augur.net"},
    //         address: "0x00bae5113ee9f252cceb0001205b88fad175461a"
    //     });
    //     test({
    //         node: {http: "https://eth3.augur.net", ws: "wss://ws.augur.net"},
    //         address: "0x00bae5113ee9f252cceb0001205b88fad175461a"
    //     });
    // });

    if (!process.env.CONTINUOUS_INTEGRATION) {
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
        assert.isTrue(connector.rpc.unlocked(connector.coinbase));
    });
    it("[async] unlocked", function (done) {
        this.timeout(TIMEOUT);
        delete require.cache[require.resolve("../")];
        var connector = require("../");
        connector.connect({http: "https://eth3.augur.net"}, function (conn) {
            connector.rpc.unlocked(connector.coinbase, function (unlocked) {
                assert.isNotNull(connector.rpc.nodes.local);
                assert.isTrue(unlocked);
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
