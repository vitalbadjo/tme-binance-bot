"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alignToStepSize = exports.TradingService = void 0;
var tslib_1 = require("tslib");
var data_1 = require("./fakeData/data");
var config_1 = require("../config");
var bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
var priceData_1 = require("./fakeData/priceData");
var binance_api_1 = require("../apis/binance-api");
var connector_1 = require("@binance/connector");
var utils_1 = require("../utils");
/**
 * must have
 * can add base balanced pairs to trade
 * +have filter to exclude assets from analysis (on add prices step)
 * -get data from binance methods - may be private
 * +make public object with all pairs and prices - ok
 * get trading row with length declared in length parameter
 * calculate trading row (maybe in get trading row function)
 * print result data from trading row delimited with ";" for import in .csv
 *
 * more: refresh input pairs data from bnb endpoint and write to local variable
 */
var TradingService = /** @class */ (function () {
    function TradingService(priceRequestIntervalSec, test, depositedCurrencies, filterAssets) {
        if (test === void 0) { test = false; }
        if (depositedCurrencies === void 0) { depositedCurrencies = ["USDT", "USDC", "BUSD", "BNB", "ETH", "BTC"]; }
        if (filterAssets === void 0) { filterAssets = []; }
        this.priceRequestIntervalSec = priceRequestIntervalSec;
        this.test = test;
        this.depositedCurrencies = depositedCurrencies;
        this.filterAssets = filterAssets;
        this.priceRequestDate = 0;
        this.dataWithPricesCache = [];
        this.priceRequestIntervalSec = priceRequestIntervalSec;
        this.test = test;
        this.depositedCurrencies = depositedCurrencies;
        this.filterAssets = filterAssets;
        this.trade = this.trade.bind(this);
    }
    TradingService.prototype.getDataWithPrices = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var prices, _a, dataWithPrices;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.priceRequestIntervalSec * 1000 + this.priceRequestDate > new Date().getTime()) {
                            console.log("Price request interval doesnt out");
                            return [2 /*return*/, this.dataWithPricesCache];
                        }
                        this.priceRequestDate = new Date().getTime();
                        if (!this.test) return [3 /*break*/, 1];
                        _a = priceData_1.priceData;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, (0, binance_api_1.getSpotRatesAll)()]; // now takes 2-3 seconds that is too much...
                    case 2:
                        _a = _b.sent(); // now takes 2-3 seconds that is too much...
                        _b.label = 3;
                    case 3:
                        prices = _a;
                        dataWithPrices = data_1.bnbInfoData.symbols
                            .filter(function (e) {
                            return e.isSpotTradingAllowed &&
                                e.status === "TRADING" &&
                                e.orderTypes.includes("MARKET") &&
                                e.permissions.includes("SPOT") &&
                                !_this.filterAssets.includes(e.baseAsset) &&
                                !_this.filterAssets.includes(e.quoteAsset);
                        })
                            .map(function (e) {
                            var baseAsset = e.baseAsset, quoteAsset = e.quoteAsset, symbol = e.symbol, filters = e.filters;
                            var filterBase = filters.find(function (el) { return el.filterType === "LOT_SIZE"; });
                            var filterQuote = filters.find(function (el) { return el.filterType === "PRICE_FILTER"; });
                            return {
                                baseAsset: baseAsset,
                                quoteAsset: quoteAsset,
                                symbol: symbol,
                                price: prices.find(function (el) { return el.symbol === symbol; }).price,
                                stepSizeQuote: filterQuote && "minPrice" in filterQuote ? filterQuote.minPrice : "0.00000001",
                                stepSizeBase: filterBase && "minQty" in filterBase ? filterBase.minQty : "1",
                            };
                        });
                        this.dataWithPricesCache = dataWithPrices;
                        return [2 /*return*/, dataWithPrices];
                }
            });
        });
    };
    //{"filterType":"LOT_SIZE","minQty":"0.00010000","maxQty":"100000.00000000","stepSize":"0.00010000"}
    TradingService.prototype.trade = function (data, test) {
        if (test === void 0) { test = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var triangle, predicatedProfit, triangleString, baseAsset, client, baseAssetAmount, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        triangle = data.triangleData, predicatedProfit = data.predicatedProfit, triangleString = data.triangleString;
                        if (!triangle.length) {
                            console.log("Triangle is empty");
                            return [2 /*return*/, { predicateProfit: predicatedProfit.string, triangleString: triangleString, realProfit: "not run" }];
                        }
                        baseAsset = this.depositedCurrencies.find(function (el) { return triangle[0].symbol.search(el) >= 0; });
                        if (!baseAsset) {
                            console.log("Cant define baseAsset of deal", triangle[0].symbol, this.depositedCurrencies);
                            return [2 /*return*/, { predicateProfit: predicatedProfit.string, triangleString: triangleString, realProfit: "not run" }];
                        }
                        client = new connector_1.Spot(process.env.APIK, process.env.APIS, { baseURL: "https://api.binance.com" });
                        return [4 /*yield*/, retryBalance(baseAsset, new bignumber_js_1.default(0), 300, 1)];
                    case 1:
                        baseAssetAmount = _a.sent();
                        console.log("retry base asset (depo) ammount: ", baseAssetAmount);
                        return [4 /*yield*/, awaitTrade(client, triangle.map(function (el) { return (tslib_1.__assign(tslib_1.__assign({}, el), { isTraded: false })); }), baseAsset, baseAssetAmount.balance.toString(), 1400, test)];
                    case 2:
                        result = _a.sent();
                        console.log("awaitTrade result: ", result);
                        return [2 /*return*/, {
                                predicateProfit: predicatedProfit.string,
                                triangleString: triangleString,
                                realProfit: new bignumber_js_1.default(result.resultBaseBalance).minus(baseAssetAmount.balance).toString(),
                            }];
                }
            });
        });
    };
    TradingService.prototype.calculateTriangleProfit = function (triangle, baseAsset) {
        if (!triangle.length) {
            console.log("Calculate Error: Triangle array is empty");
            return undefined;
        }
        var baseAssetAmount = new bignumber_js_1.default(config_1.BASE_CURRENCY_AMOUNT_FOR_CALCULATING);
        var profit = triangle.reduce(function (p, c) {
            var action = getTypeOfDeal(getOtherAsset(c.symbol, p.asset), c.symbol);
            if (action === "BUY") {
                //todo improve calculating by entire digits after testing on trade
                return {
                    asset: c.baseAsset === p.asset ? c.quoteAsset : c.baseAsset,
                    amount: p.amount.dividedBy(new bignumber_js_1.default(c.price)).multipliedBy(new bignumber_js_1.default(0.999)),
                };
            }
            else {
                return {
                    asset: c.baseAsset === p.asset ? c.quoteAsset : c.baseAsset,
                    amount: p.amount.multipliedBy(new bignumber_js_1.default(c.price)).multipliedBy(new bignumber_js_1.default(0.999)),
                };
            }
        }, { asset: baseAsset, amount: baseAssetAmount });
        var profitPercents = profit.amount.dividedBy(baseAssetAmount).minus(1).multipliedBy(100);
        return {
            profit: profitPercents,
            profitString: profitPercents.toString(),
            pairs: triangle,
        };
    };
    TradingService.prototype.getRows = function (originList, length) {
        var _this = this;
        if (length === void 0) { length = 3; }
        var byAsset = getBasePairs(originList, this.depositedCurrencies);
        var result = [];
        Object.entries(byAsset).forEach(function (_a) {
            var base = _a[0], byAssetList = _a[1];
            var triangles = constructTriangles(originList, byAssetList, base, length);
            // console.log("triangles", triangles)
            return triangles.map(function (el) {
                var calc = _this.calculateTriangleProfit(el, base);
                result = tslib_1.__spreadArray(tslib_1.__spreadArray([], result, true), [
                    {
                        triangleString: el.map(function (e) { return e.symbol; }).join(","),
                        triangleData: el,
                        predicatedProfit: { string: calc.profitString, bn: calc.profit },
                    },
                ], false);
            });
        });
        return result;
    };
    return TradingService;
}());
exports.TradingService = TradingService;
function getBasePairs(originList, baseAssets) {
    return originList.reduce(function (p, c) {
        baseAssets.forEach(function (el) {
            var _a;
            if (el === c.baseAsset || el === c.quoteAsset) {
                p = tslib_1.__assign(tslib_1.__assign({}, p), (_a = {}, _a[el] = tslib_1.__spreadArray(tslib_1.__spreadArray([], (p.hasOwnProperty(el) ? p[el] : []), true), [c], false), _a));
            }
        });
        return p;
    }, {});
}
function constructTriangles(originList, byAssetList, base, length) {
    return byAssetList
        .map(function (byAssetItem) {
        var pairRow = [byAssetItem];
        var baseAsset = byAssetItem.quoteAsset === base ? byAssetItem.baseAsset : byAssetItem.quoteAsset;
        // iterate n times to find new row in originList
        for (var i = 1; i < length; i++) {
            // console.log("pairRow.map(e => e.symbol)", pairRow.map(e => e.symbol))
            // console.log("base", base)
            // console.log("baseAsset", baseAsset)
            var element = i === length - 1
                ? findLastElementForRow(originList, pairRow.map(function (e) { return e.symbol; }), base, baseAsset)
                : findPairInOriginListByBaseAsset(originList, baseAsset, pairRow.map(function (e) { return e.symbol; }));
            // console.log("element", element)
            if (element) {
                pairRow.push(element.pair);
                baseAsset = element.newBase;
            }
            else {
                return [];
            }
        }
        return pairRow;
    })
        .filter(function (el) { return el.length; });
}
function findLastElementForRow(originList, excludePairs, base1, base2) {
    if (excludePairs === void 0) { excludePairs = []; }
    var pair = originList.find(function (el) {
        if (!excludePairs.length || (excludePairs.length && !excludePairs.includes(el.symbol))) {
            if (el.symbol === "".concat(base1).concat(base2)) {
                return true;
            }
            else if (el.symbol === "".concat(base2).concat(base1)) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    });
    if (pair) {
        return {
            pair: pair,
            newBase: "",
        };
    }
    return pair;
}
function findPairInOriginListByBaseAsset(originList, base, excludePairs) {
    if (excludePairs === void 0) { excludePairs = []; }
    var newBase = "";
    var newPair = originList.find(function (el) {
        if (!excludePairs.length || (excludePairs.length && !excludePairs.includes(el.symbol))) {
            if (el.baseAsset === base) {
                newBase = el.quoteAsset;
                return true;
            }
            else if (el.quoteAsset === base) {
                newBase = el.baseAsset;
                return true;
            }
            return false;
        }
        else {
            return false;
        }
    });
    if (newPair) {
        return {
            pair: newPair,
            newBase: newBase,
        };
    }
    else {
        return newPair;
    }
}
// function isBase(pair: DataWithPrices, asset: string): boolean {
// 	return  pair.baseAsset === asset
// }
function getTypeOfDeal(assetToBuy, pair) {
    if (pair.search(assetToBuy) === 0) {
        return "BUY";
    }
    else {
        return "SELL";
    }
}
function getOtherAsset(pair, asset) {
    return pair.search(asset) === 0 ? pair.slice(asset.length) : pair.slice(0, pair.search(asset));
}
function retryBalance(asset, expectedBalance, delayMilliSec, tryNum) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var client, balances, assetBalance, bal, isEnough;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = new connector_1.Spot(process.env.APIK, process.env.APIS, { baseURL: "https://api.binance.com" });
                    return [4 /*yield*/, client.account()];
                case 1:
                    balances = (_a.sent()).data.balances;
                    assetBalance = balances.find(function (el) { return el.asset === asset; });
                    if (assetBalance) {
                        bal = new bignumber_js_1.default(assetBalance.free);
                        isEnough = bal.gte(expectedBalance);
                        if (bal.gte(expectedBalance)) {
                            return [2 /*return*/, {
                                    balance: bal,
                                    isEnough: isEnough,
                                }];
                        }
                        else {
                            if (tryNum === 0) {
                                return [2 /*return*/, {
                                        balance: bal,
                                        isEnough: isEnough,
                                    }];
                            }
                            else {
                                return [2 /*return*/, (0, utils_1.delaySec)(delayMilliSec).then(function () { return retryBalance(asset, expectedBalance, delayMilliSec, tryNum - 1); })];
                            }
                        }
                    }
                    else {
                        console.log("Retry balance error: try number is out but balance is undefined");
                        return [2 /*return*/, {
                                balance: new bignumber_js_1.default(0),
                                isEnough: false,
                            }];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function awaitTrade(client, row, base, baseBalance, delayBetweenTrades, test) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var pairToTrade, pairToTradeIndex, symbol, newBase, action, quantityParam, tradeResult, e_1, balance;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pairToTrade = row.find(function (el) { return !el.isTraded; });
                    pairToTradeIndex = row.findIndex(function (el) { return !el.isTraded; });
                    if (!(pairToTrade && pairToTradeIndex >= 0)) return [3 /*break*/, 10];
                    symbol = pairToTrade.symbol;
                    newBase = getOtherAsset(symbol, base);
                    action = getTypeOfDeal(newBase, symbol);
                    quantityParam = action === "BUY"
                        ? { quoteOrderQty: alignToStepSize(baseBalance, pairToTrade.stepSizeQuote) }
                        : { quantity: alignToStepSize(baseBalance, pairToTrade.stepSizeBase) };
                    console.log("Trade query:", "Symbol: ".concat(symbol, "\n Action: ").concat(action, "\n Type: MARKET\nQuantity: ").concat(JSON.stringify(quantityParam)));
                    tradeResult = "";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    if (!!test) return [3 /*break*/, 3];
                    return [4 /*yield*/, client.newOrder(symbol, action, "MARKET", quantityParam)];
                case 2:
                    tradeResult = _a.sent();
                    _a.label = 3;
                case 3:
                    row[pairToTradeIndex] = tslib_1.__assign(tslib_1.__assign({}, pairToTrade), { isTraded: true });
                    if (!(tradeResult && tradeResult.data.status === "FILLED")) return [3 /*break*/, 6];
                    console.log("tradeResult.data", tradeResult.data);
                    if (!delayBetweenTrades) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, utils_1.delaySec)(delayBetweenTrades)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: 
                //todo may be await balance
                return [2 /*return*/, awaitTrade(client, row, newBase, tradeResult.data.side === "SELL" ? tradeResult.data.cummulativeQuoteQty : tradeResult.data.executedQty, delayBetweenTrades, test)];
                case 6: throw new Error("Something wrong with trade result: tradeResult is undefined");
                case 7: return [3 /*break*/, 9];
                case 8:
                    e_1 = _a.sent();
                    console.log("Cant trade this pair", e_1);
                    throw new Error(e_1);
                case 9: return [3 /*break*/, 12];
                case 10:
                    console.log("Congrats trade fully completed!!!");
                    return [4 /*yield*/, retryBalance(base, new bignumber_js_1.default(0), 200, 1)];
                case 11:
                    balance = (_a.sent()).balance;
                    return [2 /*return*/, {
                            resultBaseBalance: balance.toString(),
                        }];
                case 12: return [2 /*return*/];
            }
        });
    });
}
function alignToStepSize(price, stepSize) {
    var _a = price.split("."), priceInt = _a[0], priceDecimal = _a[1];
    if (stepSize.includes(".")) {
        var _b = stepSize.split("."), int = _b[0], decimal = _b[1];
        if (int.search("1") >= 0) {
            return priceInt;
        }
        return "".concat(priceInt, ".").concat(priceDecimal.slice(0, decimal.search("1") + 1));
    }
    else {
        return priceInt;
    }
}
exports.alignToStepSize = alignToStepSize;
