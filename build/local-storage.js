"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorage = void 0;
var tslib_1 = require("tslib");
var binance_api_1 = require("./apis/binance-api");
var LocalStorage = /** @class */ (function () {
    function LocalStorage(triggerPercentage) {
        this.triggerPercentage = triggerPercentage;
        this.users = [];
        this.cachedMarketData = {};
        this.triggerPercentage = triggerPercentage;
    }
    LocalStorage.prototype.setUser = function (chatIds) {
        var _this = this;
        console.log("this.users", this.users);
        chatIds.forEach(function (chatId) {
            if (!_this.users.includes(chatId)) {
                console.log("Adding new chat with id: ".concat(chatId, ", to local storage"));
                _this.users = tslib_1.__spreadArray(tslib_1.__spreadArray([], _this.users, true), [chatId], false);
            }
            else {
                console.log("Chat with id ".concat(chatId, " alredy exist"));
            }
        });
    };
    LocalStorage.prototype.getUsers = function () {
        return this.users;
    };
    LocalStorage.prototype.setDelivered = function (symbol) {
        if (symbol in Object.keys(this.cachedMarketData)) {
            this.cachedMarketData[symbol].isDelivered = true;
        }
    };
    // return new signals
    LocalStorage.prototype.getMarketData = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var changes, rates;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        changes = {};
                        return [4 /*yield*/, (0, binance_api_1.getRates)()
                            // Check if exist in cache
                        ];
                    case 1:
                        rates = _a.sent();
                        // Check if exist in cache
                        rates.forEach(function (el) {
                            // Filter actual signals
                            // const ratesFiltered = rates.filter(rate => parseInt(rate.priceChangePercent) >= this.triggerPercentage)
                            // console.log("ratesFiltered", ratesFiltered)
                            var newPercents = parseInt(el.priceChangePercent);
                            // if already in cache
                            if (Object.keys(_this.cachedMarketData).includes(el.symbol)) {
                                var cachedPercents = parseInt(_this.cachedMarketData[el.symbol].priceChangePercent);
                                if (newPercents >= _this.triggerPercentage) {
                                    if (newPercents > cachedPercents) {
                                        _this.cachedMarketData[el.symbol].isDelivered = false;
                                    }
                                }
                                else {
                                    _this.cachedMarketData[el.symbol].expired = true;
                                }
                            }
                            else {
                                if (newPercents >= _this.triggerPercentage) {
                                    var newData = {
                                        isDelivered: false,
                                        askPrice: el.askPrice,
                                        symbol: el.symbol,
                                        priceChangePercent: el.priceChangePercent,
                                        priceChange: el.priceChange,
                                        expired: false
                                    };
                                    changes[el.symbol] = newData;
                                    _this.cachedMarketData[el.symbol] = newData;
                                }
                            }
                        });
                        return [2 /*return*/, Object.keys(changes).length ? changes : undefined];
                }
            });
        });
    };
    return LocalStorage;
}());
exports.LocalStorage = LocalStorage;
