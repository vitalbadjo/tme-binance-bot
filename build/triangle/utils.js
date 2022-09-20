"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDelimiter = exports.addDelimiter = exports.extractAllCurrencies = exports.filterByCurrency = void 0;
var tslib_1 = require("tslib");
var config_1 = require("../config");
function filterByCurrency(currency, array) {
    return {
        currency: currency,
        filtered: array.filter(function (el) {
            var _a = el.split(config_1.CURRENCY_DELIMITER), a = _a[0], b = _a[1];
            return (a.search(currency) === 0 && a.length === currency.length) ||
                (b.search(currency) === 0 && b.length === currency.length);
        }),
    };
}
exports.filterByCurrency = filterByCurrency;
function extractAllCurrencies(pairs) {
    return pairs.reduce(function (p, c) {
        var _a = c.split(config_1.CURRENCY_DELIMITER), a = _a[0], b = _a[1];
        if (!p.includes(a)) {
            return tslib_1.__spreadArray(tslib_1.__spreadArray([], p, true), [a], false);
        }
        if (!p.includes(b)) {
            return tslib_1.__spreadArray(tslib_1.__spreadArray([], p, true), [b], false);
        }
        return p;
    }, []);
}
exports.extractAllCurrencies = extractAllCurrencies;
function addDelimiter(bnbPair, allCurrencies) {
    var delimitedPair = "";
    allCurrencies.forEach(function (el) {
        var pos = bnbPair.search(el);
        if (pos === 0) {
            delimitedPair = bnbPair.slice(0, el.length) + config_1.CURRENCY_DELIMITER + bnbPair.slice(el.length);
        }
        if (pos >= 0) {
            delimitedPair = bnbPair.slice(0, pos) + config_1.CURRENCY_DELIMITER + bnbPair.slice(pos);
        }
    });
    if (!delimitedPair.length) {
        throw new Error("Delimiter adding error");
    }
    return delimitedPair;
}
exports.addDelimiter = addDelimiter;
function removeDelimiter(pairsWithDelimiter) {
    return pairsWithDelimiter.map(function (el) { return el.split(config_1.CURRENCY_DELIMITER).join(""); });
}
exports.removeDelimiter = removeDelimiter;
