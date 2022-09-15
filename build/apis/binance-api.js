"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpotRates = exports.getSpotRatesAll = exports.getSpotAssets = exports.getRates = void 0;
var tslib_1 = require("tslib");
var axios_1 = tslib_1.__importDefault(require("axios"));
var config_1 = require("../config");
var utils_1 = require("../triangle/utils");
var priceData_1 = require("../triangle/fakeData/priceData");
var SPOT_REQUEST_PAIRS_LIMIT = 100;
function getRates() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var response;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.create().get("".concat(config_1.CONFIG.binance.fapiBaseUrl, "/fapi/v1/ticker/24hr"))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    });
}
exports.getRates = getRates;
function getSpotAssets() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var response;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.create().get("".concat(config_1.CONFIG.binance.apiBaseUrl, "/api/v3/exchangeInfo"))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    });
}
exports.getSpotAssets = getSpotAssets;
function getSpotRatesAll() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var response;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.create().get("".concat(config_1.CONFIG.binance.apiBaseUrl, "/api/v3/ticker/price"))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    });
}
exports.getSpotRatesAll = getSpotRatesAll;
//important symbol parameter without delimiter
function getSpotRates(symbols, test) {
    if (test === void 0) { test = false; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var symbolsDelimited_1, currencies, response, _a, symbol, price, response;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (test) {
                        symbolsDelimited_1 = (0, utils_1.removeDelimiter)(symbols);
                        return [2 /*return*/, priceData_1.priceData.filter(function (el) { return symbolsDelimited_1.includes(el.symbol); }).map(function (el) {
                                var symbol = symbols.find(function (val) { return val.split(config_1.CURRENCY_DELIMITER).join("") === el.symbol; });
                                if (!symbol) {
                                    console.log("TEST BRANCH Console error", "symbol:", symbol);
                                    throw new Error("TEST BRANCH Response is OK, but add delimiter is throw error");
                                }
                                return {
                                    symbol: symbol,
                                    price: el.price
                                };
                            })];
                    }
                    if (!(symbols.length === 1)) return [3 /*break*/, 2];
                    symbols = (0, utils_1.removeDelimiter)(symbols);
                    currencies = (0, utils_1.extractAllCurrencies)(symbols);
                    return [4 /*yield*/, axios_1.default.create().get("".concat(config_1.CONFIG.binance.apiBaseUrl, "/api/v3/ticker/price?symbol=").concat(symbols[0]))];
                case 1:
                    response = _b.sent();
                    _a = response.data, symbol = _a.symbol, price = _a.price;
                    return [2 /*return*/, [{
                                symbol: (0, utils_1.addDelimiter)(symbol, currencies),
                                price: price,
                            }]];
                case 2:
                    if (!(symbols.length > 0)) return [3 /*break*/, 4];
                    symbols = (0, utils_1.removeDelimiter)(symbols);
                    if (symbols.length > SPOT_REQUEST_PAIRS_LIMIT) {
                        throw new Error("Too big request (more than ".concat(SPOT_REQUEST_PAIRS_LIMIT, " elements)"));
                    }
                    return [4 /*yield*/, axios_1.default.create().get("".concat(config_1.CONFIG.binance.apiBaseUrl, "/api/v3/ticker/price?symbols=").concat(symbols))];
                case 3:
                    response = _b.sent();
                    return [2 /*return*/, response.data.map(function (el) {
                            return {
                                symbol: symbols.find(function (val) { return val.split(config_1.CURRENCY_DELIMITER).join("") === el.symbol; }),
                                price: el.price
                            };
                        })];
                case 4: throw new Error("Get Spot rates request is empty");
            }
        });
    });
}
exports.getSpotRates = getSpotRates;
