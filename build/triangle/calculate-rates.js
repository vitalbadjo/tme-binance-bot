"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permutateTriangle = exports.calcSingle = exports.calculateRates = void 0;
var tslib_1 = require("tslib");
var index_1 = require("./index");
var data_1 = require("./fakeData/data");
var utils_1 = require("./utils");
var binance_api_1 = require("../apis/binance-api");
var config_1 = require("../config");
var bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
function calculateRates(test) {
    if (test === void 0) { test = false; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var triangles, pairs, prices, raw;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    triangles = (0, index_1.getTriangles)(data_1.bnbInfoData);
                    pairs = (0, utils_1.extractUniquePairs)(triangles);
                    return [4 /*yield*/, (0, binance_api_1.getSpotRates)(pairs, test)];
                case 1:
                    prices = _a.sent();
                    raw = triangles.map(function (el) {
                        return calcSingle(el, prices);
                    });
                    return [2 /*return*/, uniqBy(raw, function (it) { return it.pair1.pairName; })];
            }
        });
    });
}
exports.calculateRates = calculateRates;
// type Unpacked<T> = T extends (infer U)[] ? U : T
function uniqBy(a, key) {
    var seen = new Set();
    return a.filter(function (item) {
        var k = key(item);
        return seen.has(k) ? false : seen.add(k);
    });
}
function calcSingle(triangle, prices) {
    var trianglePrices = prices.reduce(function (p, c) {
        if (triangle.includes(c.symbol)) {
            var _a = c.symbol.split(config_1.CURRENCY_DELIMITER), firstCurr = _a[0], secondCurr = _a[1];
            return tslib_1.__spreadArray(tslib_1.__spreadArray([], p, true), [{
                    symbol: c.symbol,
                    price: c.price,
                    firstCurr: firstCurr,
                    secondCurr: secondCurr
                }], false);
        }
        return p;
    }, []);
    if (trianglePrices.length !== 3) {
        throw new Error("Not found all prices in calcSingle function");
    }
    var _a = permutateTriangle(trianglePrices), pair1 = _a[0], pair2 = _a[1], pair3 = _a[2];
    var baseCurrency = {
        pairName: pair1.secondCurr,
        amount: new bignumber_js_1.default(config_1.BASE_CURRENCY_AMOUNT_FOR_CALCULATING),
    };
    //buy first for second
    var secondCurrency = {
        pairName: pair1.firstCurr,
        amount: baseCurrency.amount.dividedBy(new bignumber_js_1.default(pair1.price)),
    };
    //sell first for third
    var thirdCurrency = {
        pairName: pair2.secondCurr,
        amount: secondCurrency.amount.multipliedBy(new bignumber_js_1.default(pair2.price))
    };
    var newBaseCurrAmount;
    var pair3Action;
    // buy first for third
    if (pair2.secondCurr === pair3.firstCurr) {
        newBaseCurrAmount = thirdCurrency.amount.multipliedBy(new bignumber_js_1.default(pair3.price));
        pair3Action = "SELL";
    }
    else {
        newBaseCurrAmount = thirdCurrency.amount.dividedBy(new bignumber_js_1.default(pair3.price));
        pair3Action = "BUY";
    }
    var profit = newBaseCurrAmount.dividedBy(baseCurrency.amount).minus(1).multipliedBy(100);
    return {
        profitPercentString: profit.toString(),
        profitPercent: profit,
        pairs: [pair1.symbol, pair2.symbol, pair3.symbol],
        pair1: {
            pairName: pair1.symbol,
            action: "BUY"
        },
        pair2: {
            pairName: pair2.symbol,
            action: "SELL"
        },
        pair3: {
            pairName: pair3.symbol,
            action: pair3Action
        }
    };
}
exports.calcSingle = calcSingle;
function permutateTriangle(triangle) {
    var pair1 = triangle[0], pair2 = triangle[1], pair3 = triangle[2];
    var _a = pair1.symbol.split(config_1.CURRENCY_DELIMITER), p1c1 = _a[0], p1c2 = _a[1];
    var _b = pair2.symbol.split(config_1.CURRENCY_DELIMITER), p2c1 = _b[0], p2c2 = _b[1];
    var p3c1 = pair3.symbol.split(config_1.CURRENCY_DELIMITER)[0];
    if (p1c1 === p2c1) {
        if (p1c2 === p3c1) {
            return [pair2, pair1, pair3];
        }
        else {
            return [pair1, pair2, pair3];
        }
    }
    else if (p1c1 === p3c1) {
        if (p1c2 === p2c1) {
            return [pair3, pair1, pair2];
        }
        else {
            return [pair1, pair3, pair2];
        }
    }
    else if (p2c1 === p3c1) {
        if (p2c2 === p1c1) {
            return [pair3, pair2, pair1];
        }
        else {
            return [pair2, pair3, pair1];
        }
    }
    else {
        return [pair1, pair2, pair3];
    }
}
exports.permutateTriangle = permutateTriangle;
