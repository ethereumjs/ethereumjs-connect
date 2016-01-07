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
var HOSTED_NODE = "0xaff9cb4dcb19d13b84761c040c91d21dc6c991ec";
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
        object: {host: "eth1.augur.net"},
        string: "http://eth1.augur.net"
    });
    test({
        object: {host: "eth1.augur.net", protocol: "https"},
        string: "https://eth1.augur.net"
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

        var test = function (url) {
            it(url, function () {
                this.timeout(TIMEOUT);
                delete require.cache[require.resolve("../")];
                var connector = require("../");
                assert.isTrue(connector.connect(this.test.title));
                assert.strictEqual(connector.coinbase, HOSTED_NODE);
            });
        };

        test("https://eth1.augur.net");
        test("https://eth3.augur.net");
        test("https://eth4.augur.net");
        test("https://eth5.augur.net");
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
            it("[sync] switch to network 10101 contract addresses", function () {
                this.timeout(TIMEOUT);
                delete require.cache[require.resolve("../")];
                var connector = require("../");
                assert.isTrue(connector.connect("http://localhost:8545"));
                assert.strictEqual(connector.contracts.branches, contracts["10101"].branches);
                assert.strictEqual(connector.contracts.createMarket, contracts["10101"].createMarket);
                assert.isTrue(connector.connect({host: "localhost", port: 8545}));
                assert.strictEqual(connector.contracts.branches, contracts["10101"].branches);
                assert.strictEqual(connector.contracts.createMarket, contracts["10101"].createMarket);
                assert.isTrue(connector.connect({host: "127.0.0.1", port: 8545}));
                assert.strictEqual(connector.contracts.branches, contracts["10101"].branches);
                assert.strictEqual(connector.contracts.createMarket, contracts["10101"].createMarket);
            });
            it("[sync+IPC] switch to network 10101 contract addresses", function () {
                this.timeout(TIMEOUT);
                delete require.cache[require.resolve("../")];
                var connector = require("../");
                assert.isTrue(connector.connect(null, IPCPATH));
                assert.strictEqual(connector.contracts.branches, contracts["10101"].branches);
                assert.strictEqual(connector.contracts.createMarket, contracts["10101"].createMarket);
                assert.isTrue(connector.connect("http://localhost:8545", IPCPATH));
                assert.strictEqual(connector.contracts.branches, contracts["10101"].branches);
                assert.strictEqual(connector.contracts.createMarket, contracts["10101"].createMarket);
                assert.isTrue(connector.connect({host: "localhost", port: 8545}, IPCPATH));
                assert.strictEqual(connector.contracts.branches, contracts["10101"].branches);
                assert.strictEqual(connector.contracts.createMarket, contracts["10101"].createMarket);
                assert.isTrue(connector.connect({host: "127.0.0.1", port: 8545}, IPCPATH));
                assert.strictEqual(connector.contracts.branches, contracts["10101"].branches);
                assert.strictEqual(connector.contracts.createMarket, contracts["10101"].createMarket);
            });
            it("[async] switch to network 10101 contract addresses", function (done) {
                this.timeout(TIMEOUT);
                delete require.cache[require.resolve("../")];
                var connector = require("../");
                connector.connect("http://localhost:8545", null, function (connected) {
                    assert.isTrue(connected);
                    assert.strictEqual(connector.contracts.branches, contracts["10101"].branches);
                    assert.strictEqual(connector.contracts.createMarket, contracts["10101"].createMarket);
                    connector.connect({host: "localhost", port: 8545}, null, function (connected) {
                        assert.isTrue(connected);
                        assert.strictEqual(connector.contracts.branches, contracts["10101"].branches);
                        assert.strictEqual(connector.contracts.createMarket, contracts["10101"].createMarket);
                        connector.connect({host: "127.0.0.1", port: 8545}, null, function (connected) {
                            assert.isTrue(connected);
                            assert.strictEqual(connector.contracts.branches, contracts["10101"].branches);
                            assert.strictEqual(connector.contracts.createMarket, contracts["10101"].createMarket);
                            done();
                        });
                    });
                });
            });
            it("[async+IPC] switch to network 10101 contract addresses", function (done) {
                this.timeout(TIMEOUT);
                delete require.cache[require.resolve("../")];
                var connector = require("../");
                connector.connect(null, IPCPATH, function (connected) {
                    assert.isTrue(connected);
                    assert.strictEqual(connector.contracts.branches, contracts["10101"].branches);
                    assert.strictEqual(connector.contracts.createMarket, contracts["10101"].createMarket);
                    connector.connect("http://localhost:8545", IPCPATH, function (connected) {
                        assert.isTrue(connected);
                        assert.strictEqual(connector.contracts.branches, contracts["10101"].branches);
                        assert.strictEqual(connector.contracts.createMarket, contracts["10101"].createMarket);
                        connector.connect({host: "localhost", port: 8545}, IPCPATH, function (connected) {
                            assert.isTrue(connected);
                            assert.strictEqual(connector.contracts.branches, contracts["10101"].branches);
                            assert.strictEqual(connector.contracts.createMarket, contracts["10101"].createMarket);
                            connector.connect({host: "127.0.0.1", port: 8545}, IPCPATH, function (connected) {
                                assert.isTrue(connected);
                                assert.strictEqual(connector.contracts.branches, contracts["10101"].branches);
                                assert.strictEqual(connector.contracts.createMarket, contracts["10101"].createMarket);
                                done();
                            });
                        });
                    });
                });
            });
            it("[sync] update the transaction object addresses when contracts are changed", function () {
                this.timeout(TIMEOUT);
                delete require.cache[require.resolve("../")];
                var connector = require("../");
                var new_address = "0x01";
                connector.contracts.branches = new_address;
                connector.connect();
                assert.strictEqual(connector.contracts.branches, new_address);
                var newer_address = "0x02";
                connector.contracts.branches = newer_address;
                connector.connect();
                assert.strictEqual(connector.contracts.branches, newer_address);
            });
            it("[async] update the transaction object addresses when contracts are changed", function (done) {
                this.timeout(TIMEOUT);
                delete require.cache[require.resolve("../")];
                var connector = require("../");
                var new_address = "0x01";
                connector.contracts.branches = new_address;
                connector.connect(function (connected) {
                    assert.isTrue(connected);
                    assert.strictEqual(connector.contracts.branches, new_address);
                    var newer_address = "0x02";
                    connector.contracts.branches = newer_address;
                    connector.connect(null, function (connected) {
                        assert.isTrue(connected);
                        assert.strictEqual(connector.contracts.branches, newer_address);
                        done();
                    });
                });
            });
        });
    }

    it("[sync] unlocked", function () {
        this.timeout(TIMEOUT);
        delete require.cache[require.resolve("../")];
        var connector = require("../");
        assert.isTrue(connector.connect("https://eth1.augur.net"));
        assert.isNotNull(connector.rpc.nodes.local);
        assert.isTrue(connector.rpc.unlocked(connector.coinbase));
    });
    it("[async] unlocked", function (done) {
        this.timeout(TIMEOUT);
        delete require.cache[require.resolve("../")];
        var connector = require("../");
        connector.connect("https://eth1.augur.net", function (connected) {
            assert.isTrue(connected);
            connector.rpc.unlocked(connector.coinbase, function (unlocked) {
                assert.isNotNull(connector.rpc.nodes.local);
                assert.isTrue(unlocked);
                done();
            });
        });
    });

    it("network_id = 0, 1, 10101, or 7", function () {
        delete require.cache[require.resolve("../")];
        var connector = require("../");
        assert.isTrue(connector.connect());
        assert.include(["0", "1", "10101", "7"], connector.network_id);
    });

});
