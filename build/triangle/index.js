"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTriangles = void 0;
var tslib_1 = require("tslib");
var utils_1 = require("./utils");
var config_1 = require("../config");
/**
 *
 * get info from binance
 * get all prices
 * construct union array with prices and remove unused fields
 * make triangles(and permutate it) filtered from duplicates (concat string of pairs)
 * calc
 * trade higest!
 */
function getTriangles(symbolsData, filter, exclude) {
    var symbols = symbolsData.symbols
        .filter(function (e) { return e.isSpotTradingAllowed && e.status === "TRADING" && e.orderTypes.includes("MARKET") && e.permissions.includes("SPOT"); })
        .map(function (e) { return addDelimiter(e.baseAsset, e.quoteAsset); });
    return symbols.reduce(function (p, c, _, arr) {
        var _a = c.split(config_1.CURRENCY_DELIMITER), currA = _a[0], currB = _a[1];
        if (filter && currA !== filter && currB !== filter) {
            return p;
        }
        if (exclude && (exclude.includes(currA) || exclude.includes(currB))) {
            return p;
        }
        var _b = (0, utils_1.filterByCurrency)(currA, arr), baseA = _b.currency, filteredByA = _b.filtered;
        var filteredByB = (0, utils_1.filterByCurrency)(currB, arr).filtered;
        filteredByA.forEach(function (ela) {
            var _a = ela.split(config_1.CURRENCY_DELIMITER), aa = _a[0], ab = _a[1];
            if (aa === baseA) {
                filteredByB.forEach(function (elb) {
                    var _a = elb.split(config_1.CURRENCY_DELIMITER), ba = _a[0], bb = _a[1];
                    if ((ba === ab || bb === ab) && compareTriangle(c, ela, elb)) {
                        p = tslib_1.__spreadArray(tslib_1.__spreadArray([], p, true), [[c, ela, elb]], false);
                    }
                });
            }
            else {
                filteredByB.forEach(function (elb) {
                    var _a = elb.split(config_1.CURRENCY_DELIMITER), ba = _a[0], bb = _a[1];
                    if ((ba === aa || bb === aa) && compareTriangle(c, ela, elb)) {
                        p = tslib_1.__spreadArray(tslib_1.__spreadArray([], p, true), [[c, ela, elb]], false);
                    }
                });
            }
        });
        return p;
    }, []);
}
exports.getTriangles = getTriangles;
function compareTriangle(a, b, c) {
    return a !== b && b !== c && c !== a;
}
function addDelimiter(a, b) {
    return "".concat(a).concat(config_1.CURRENCY_DELIMITER).concat(b);
}
