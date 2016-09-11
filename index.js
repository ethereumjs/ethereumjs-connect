/**
 * Basic Ethereum connection tasks.
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var async = require("async");
var rpc = require("ethrpc");
var contracts = require("augur-contracts");
var network_id = "2";

function noop() {}

function is_function(f) {
    return Object.prototype.toString.call(f) === "[object Function]";
}

function clone(obj) {
    if (null === obj || "object" !== typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

var api = new contracts.Tx(network_id);

module.exports = {

    debug: false,

    from: null,

    coinbase: null,

    connection: null,

    rpc: rpc,

    network_id: network_id,

    contracts: contracts[network_id],

    init_contracts: contracts[network_id],

    custom_contracts: null,

    api: api,

    tx: api.functions,

    has_value: function (o, v) {
        for (var p in o) {
            if (o.hasOwnProperty(p)) {
                if (o[p] === v) return p;
            }
        }
    },

    detect_network: function (callback) {
        var self = this;
        if (this.connection === null &&
            JSON.stringify(this.init_contracts) === JSON.stringify(this.contracts))
        {
            if (is_function(callback)) {
                this.rpc.version(function (version) {
                    var key, method;
                    if (version !== null && version !== undefined && !version.error) {
                        self.network_id = version;
                        self.api = new contracts.Tx(version, self.custom_contracts);
                        self.contracts = clone(self.custom_contracts || contracts[self.network_id]);
                        for (method in self.api.functions) {
                            if (!self.api.functions.hasOwnProperty(method)) continue;
                            key = self.has_value(self.init_contracts, self.api.functions[method].to);
                            if (key) self.api.functions[method].to = self.contracts[key];
                        }
                        self.tx = self.api.functions;
                    } else {
                        return callback(version);
                    }
                    self.rpc.getGasPrice(function (gasPrice) {
                        if (!gasPrice || gasPrice.error) return callback(gasPrice);
                        self.rpc.gasPrice = parseInt(gasPrice, 16);
                        callback(null, version);
                    });
                });
            } else {
                var key, method;
                this.rpc.blockNumber(noop);
                this.network_id = this.rpc.version() || "2";
                this.api = new contracts.Tx(this.network_id, this.custom_contracts);
                this.contracts = clone(this.custom_contracts || contracts[this.network_id]);
                for (method in this.api.functions) {
                    if (!this.api.functions.hasOwnProperty(method)) continue;
                    key = this.has_value(this.init_contracts, this.api.functions[method].to);
                    if (key) this.api.functions[method].to = this.contracts[key];
                }
                this.tx = this.api.functions;
                this.rpc.gasPrice = parseInt(this.rpc.getGasPrice(), 16);
                return this.network_id;
            }
        } else {
            if (is_function(callback)) callback();
        }
    },

    from_field_tx: function (account) {
        if (account && account !== "0x") {
            for (var contract in this.tx) {
                if (!this.tx.hasOwnProperty(contract)) continue;
                for (var method in this.tx[contract]) {
                    if (!this.tx[contract].hasOwnProperty(method)) continue;
                    this.tx[contract][method].from = account;
                }
            }
        }
    },

    get_coinbase: function (callback) {
        var self = this;
        if (is_function(callback)) {
            this.rpc.coinbase(function (coinbase) {
                if (coinbase && !coinbase.error && coinbase !== "0x") {
                    self.coinbase = coinbase;
                    self.from = self.from || coinbase;
                    self.from_field_tx(self.from);
                    if (callback) return callback(null, coinbase);
                }
                if (!self.coinbase && (self.rpc.nodes.local || self.rpc.ipcpath)) {
                    self.rpc.accounts(function (accounts) {
                        if (accounts && accounts.constructor === Array && accounts.length) {
                            async.eachSeries(accounts, function (account, nextAccount) {
                                if (self.unlocked(account)) return nextAccount(account);
                                nextAccount();
                            }, function (account) {
                                if (!account) return callback("get_coinbase: coinbase not found");
                                self.coinbase = account;
                                self.from = self.from || account;
                                self.from_field_tx(self.from);
                                callback(null, account);
                            });
                        }
                    });
                }
            });
        } else {
            var accounts, num_accounts, i, method, m;
            this.coinbase = this.rpc.coinbase();
            if (!this.coinbase && this.rpc.nodes.local) {
                accounts = this.rpc.accounts();
                if (accounts && accounts.constructor === Array) {
                    num_accounts = accounts.length;
                    if (num_accounts === 1) {
                        if (this.unlocked(accounts[0])) {
                            this.coinbase = accounts[0];
                        }
                    } else {
                        for (i = 0; i < num_accounts; ++i) {
                            if (this.unlocked(accounts[i])) {
                                this.coinbase = accounts[i];
                                break;
                            }
                        }
                    }
                }
            }
            if (this.coinbase && !this.coinbase.error && this.coinbase !== "0x") {
                this.from = this.from || this.coinbase;
                for (method in this.tx) {
                    if (!this.tx.hasOwnProperty(method)) continue;
                    if (!this.tx[method].method) {
                        for (m in this.tx[method]) {
                            if (!this.tx[method].hasOwnProperty(m)) continue;
                            this.tx[method][m].from = this.from;
                        }
                    } else {
                        this.tx[method].from = this.from;
                    }
                }
            } else {
                throw new Error("get_coinbase: coinbase not found");
            }
        }
    },

    update_contracts: function () {
        var key;
        if (JSON.stringify(this.init_contracts) !== JSON.stringify(this.contracts)) {
            for (var method in this.tx) {
                if (!this.tx.hasOwnProperty(method)) continue;
                if (!this.tx[method].method) {
                    for (var m in this.tx[method]) {
                        if (!this.tx[method].hasOwnProperty(m)) continue;
                        key = this.has_value(this.init_contracts, this.tx[method][m].to);
                        if (key) {
                            this.tx[method][m].to = this.contracts[key];
                        }
                    }
                } else {
                    key = this.has_value(this.init_contracts, this.tx[method].to);
                    if (key) {
                        this.tx[method].to = this.contracts[key];
                    }
                }
            }
        }
        this.init_contracts = clone(this.contracts);
    },

    connect: function (options, callback) {
        var self = this;
        if (!callback && is_function(options)) {
            callback = options;
            options = null;
        }
        options = options || {};
        if (options.contracts) {
            this.contracts = clone(options.contracts);
            this.init_contracts = clone(options.contracts);
            this.custom_contracts = clone(options.contracts);
        }

        // if this is the first attempt to connect, connect using the
        // parameters provided by the user exactly
        if ((options.http || options.ipc || options.ws) && !options.attempts) {
            this.rpc.ipcpath = options.ipc || null;
            this.rpc.nodes.local = options.http;
            this.rpc.nodes.hosted = [];
            this.rpc.wsUrl = options.ws;
            this.rpc.rpcStatus.ws = 0;
            this.rpc.rpcStatus.ipc = 0;

        // if this is the second attempt to connect, fall back to the
        // default hosted nodes
        } else {
            if (this.debug) {
                console.debug("Connecting to hosted Ethereum node...");
            }
            this.rpc.ipcpath = null;
            this.rpc.reset();
            this.rpc.useHostedNode();
            this.rpc.rpcStatus.ws = 0;
            this.rpc.rpcStatus.ipc = 0;
            if (this.debug) {
                console.debug("HTTP RPC:", JSON.stringify(this.rpc.nodes.hosted, null, 2));
                console.debug("WebSocket:", this.rpc.wsUrl);
            }
        }

        // synchronous connect sequence
        if (!is_function(callback)) {
            try {
                this.detect_network();
                this.get_coinbase();
                this.update_contracts();
                this.connection = true;
                return {
                    http: this.rpc.nodes.local || this.rpc.nodes.hosted,
                    ws: this.rpc.wsUrl,
                    ipc: this.rpc.ipcpath
                };
            } catch (exc) {
                if (this.debug) {
                    console.warn("[sync] Couldn't connect to Ethereum", exc, JSON.stringify(options, null, 2));
                }
                this.connection = false;
                if (!options.attempts) {
                    options.attempts = 1;
                    return this.connect(options);
                }
                return false;
            }
        }

        // asynchronous connect sequence
        callback = callback || noop;
        async.series([
            function (next) {
                if (!options.http || !options.ws) return next();
                var wsUrl = self.rpc.wsUrl;
                var wsStatus = self.rpc.rpcStatus.ws;
                self.rpc.wsUrl = null;
                self.rpc.rpcStatus.ws = 0;
                self.detect_network(function (err) {
                    self.rpc.wsUrl = wsUrl;
                    self.rpc.rpcStatus.ws = wsStatus;
                    next(err);
                });
            },
            this.detect_network.bind(this),
            this.get_coinbase.bind(this)
        ], function (err) {
            if (err) {
                if (self.debug) {
                    console.warn("[async] Couldn't connect to Ethereum", err, JSON.stringify(options, null, 2));
                }
                self.connection = false;
                if (!options.attempts) {
                    options.attempts = 1;
                    return self.connect(options, callback);
                }
                return callback(false);
            }
            self.update_contracts();
            self.connection = true;
            callback({
                http: self.rpc.nodes.local || self.rpc.nodes.hosted,
                ws: self.rpc.wsUrl,
                ipc: self.rpc.ipcpath
            });
        });
    },

    connected: function (f) {
        if (is_function(f)) {
            return this.rpc.coinbase(function (coinbase) {
                f(coinbase && !coinbase.error);
            });
        }
        try {
            this.rpc.coinbase();
            return true;
        } catch (e) {
            return false;
        }
    }

};
