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
var IPCPATH = join(process.env.HOME, ".ethereum", "geth.ipc");

require('it-each')({ testPerIteration: true });

function clone(obj) {
    if (null === obj || "object" !== typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

describe("urlstring", function () {

    var test = function (t) {
        it(JSON.stringify(t.object) + " -> " + t.string, function () {
            assert.strictEqual(connector.urlstring(t.object), t.string);
        });
    };

    test({
        object: {host: "localhost", port: 8545, protocol: "http"},
        string: "http://localhost:8545"
    });
    test({
        object: {host: "localhost", port: 8545},
        string: "http://localhost:8545"
    });
    test({
        object: {host: "localhost"},
        string: "http://localhost"
    });
    test({
        object: {port: 8545},
        string: "http://127.0.0.1:8545"
    });
    test({
        object: {host: "127.0.0.1"},
        string: "http://127.0.0.1"
    });
    test({
        object: {host: "eth3.augur.net"},
        string: "http://eth3.augur.net"
    });
    test({
        object: {host: "eth3.augur.net", protocol: "https"},
        string: "https://eth3.augur.net"
    });
    test({
        object: {host: "127.0.0.1", port: 8547, protocol: "https"},
        string: "https://127.0.0.1:8547"
    });
});

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

    describe("hosted nodes", function () {

        var test = function (t) {
            it(t.node, function () {
                this.timeout(TIMEOUT);
                delete require.cache[require.resolve("../")];
                var connector = require("../");
                assert.isTrue(connector.connect(t.node));
                assert.strictEqual(connector.coinbase, t.address);
            });
        };

        test({
            node: "https://eth3.augur.net",
            address: "0x00bae5113ee9f252cceb0001205b88fad175461a"
        });
        test({
            node: "https://eth4.augur.net",
            address: "0x8296eb59079f435275b76058c08b47c4f8965b78"
        });
        test({
            node: "https://eth5.augur.net",
            address: "0xe434ed7f4684e3d2db25c4937c9e0b7b1faf54c6"
        });
    });

    if (!process.env.CONTINUOUS_INTEGRATION) {
        describe("local node", function () {
            var connectString = [
                undefined,
                "http://localhost:8545",
                "localhost:8545",
                "127.0.0.1:8545",
                "http://127.0.0.1:8545"
            ];
            var connectObj = [
                {host: "localhost", port: 8545, protocol: "http"},
                {host: "localhost", port: 8545},
                {port: 8545},
            ];
            it.each(connectString,
                "[sync] connect to %s",
                ["element"],
                function (element, next) {
                    this.timeout(TIMEOUT);
                    delete require.cache[require.resolve("../")];
                    var connector = require("../");
                    assert.isTrue(connector.connect(element));
                    assert.isTrue(connector.connected());
                    assert.isString(connector.coinbase);
                    next();
                }
            );
            it.each(connectString,
                "[sync] connect to %s with IPC support",
                ["element"],
                function (element, next) {
                    this.timeout(TIMEOUT);
                    delete require.cache[require.resolve("../")];
                    var connector = require("../");
                    assert.isTrue(connector.connect(element, IPCPATH));
                    assert.isTrue(connector.connected());
                    assert.isString(connector.coinbase);
                    next();
                }
            );
            it.each(connectString,
                "[async] connect to %s",
                ["element"],
                function (element, next) {
                    this.timeout(TIMEOUT);
                    delete require.cache[require.resolve("../")];
                    var connector = require("../");
                    connector.connect(element, null, function (connected) {
                        assert.isTrue(connected);
                        assert.isString(connector.coinbase);
                        next();
                    });
                }
            );
            it.each(connectString,
                "[async] connect to %s",
                ["element"],
                function (element, next) {
                    this.timeout(TIMEOUT);
                    delete require.cache[require.resolve("../")];
                    var connector = require("../");
                    connector.connect(element, function (connected) {
                        assert.isTrue(connected);
                        assert.isString(connector.coinbase);
                        next();
                    });
                }
            );
            it.each(connectString,
                "[async] connect to %s with IPC support",
                ["element"],
                function (element, next) {
                    this.timeout(TIMEOUT);
                    delete require.cache[require.resolve("../")];
                    var connector = require("../");
                    connector.connect(element, IPCPATH, function (connected) {
                        assert.isTrue(connected);
                        assert.isString(connector.coinbase);
                        next();
                    });
                }
            );
            it.each(connectObj,
                "[sync] connect to {protocol: '%s', host: '%s', port: '%s'}",
                ["protocol", "host", "port"],
                function (element, next) {
                    this.timeout(TIMEOUT);
                    delete require.cache[require.resolve("../")];
                    var connector = require("../");
                    assert.isTrue(connector.connect(element));
                    assert.isTrue(connector.connected());
                    assert.isString(connector.coinbase);
                    next();
                }
            );
            it.each(connectObj,
                "[sync] connect to {protocol: '%s', host: '%s', port: '%s'} with IPC support",
                ["protocol", "host", "port"],
                function (element, next) {
                    this.timeout(TIMEOUT);
                    delete require.cache[require.resolve("../")];
                    var connector = require("../");
                    assert.isTrue(connector.connect(element, IPCPATH));
                    assert.isTrue(connector.connected());
                    assert.isString(connector.coinbase);
                    next();
                }
            );
            it.each(connectObj,
                "[async] connect to {protocol: '%s', host: '%s', port: '%s'}",
                ["protocol", "host", "port"],
                function (element, next) {
                    this.timeout(TIMEOUT);
                    delete require.cache[require.resolve("../")];
                    var connector = require("../");
                    connector.connect(element, null, function (connected) {
                        assert.isTrue(connected);
                        assert.isString(connector.coinbase);
                        next();
                    });
                }
            );
            it.each(connectObj,
                "[async] connect to {protocol: '%s', host: '%s', port: '%s'}",
                ["protocol", "host", "port"],
                function (element, next) {
                    this.timeout(TIMEOUT);
                    delete require.cache[require.resolve("../")];
                    var connector = require("../");
                    connector.connect(element, function (connected) {
                        assert.isTrue(connected);
                        assert.isString(connector.coinbase);
                        next();
                    });
                }
            );
            it.each(connectObj,
                "[async] connect to {protocol: '%s', host: '%s', port: '%s'} with IPC support",
                ["protocol", "host", "port"],
                function (element, next) {
                    this.timeout(TIMEOUT);
                    delete require.cache[require.resolve("../")];
                    var connector = require("../");
                    connector.connect(element, IPCPATH, function (connected) {
                        assert.isTrue(connected);
                        assert.isString(connector.coinbase);
                        next();
                    });
                }
            );
        });
    }

    it("[sync] unlocked", function () {
        this.timeout(TIMEOUT);
        delete require.cache[require.resolve("../")];
        var connector = require("../");
        assert.isTrue(connector.connect("https://eth3.augur.net"));
        assert.isNotNull(connector.rpc.nodes.local);
        assert.isFalse(connector.rpc.unlocked(connector.coinbase));
    });
    it("[async] unlocked", function (done) {
        this.timeout(TIMEOUT);
        delete require.cache[require.resolve("../")];
        var connector = require("../");
        connector.connect("https://eth3.augur.net", function (connected) {
            assert.isTrue(connected);
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
        assert.isTrue(connector.connect());
        assert.include(["0", "1", "2", "7", "10101"], connector.network_id);
    });

});
