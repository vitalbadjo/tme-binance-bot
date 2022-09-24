"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testData = exports.getRateGarantex = void 0;
var tslib_1 = require("tslib");
var bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
var axios_1 = tslib_1.__importDefault(require("axios"));
var config_1 = require("../config");
function getRateGarantex() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var response, data, bids;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.create().get("".concat(config_1.CONFIG.garantex.apiBaseUrl, "/depth?market=usdtrub"))];
                case 1:
                    response = _a.sent();
                    data = response.data;
                    bids = data.bids.reduce(function (p, c) {
                        var summ = p.reduce(function (pr, cu) { return pr.plus(new bignumber_js_1.default(cu.volume)); }, new bignumber_js_1.default(0));
                        if (summ.lt(new bignumber_js_1.default(config_1.CONFIG.garantex.limitUstForBids))) {
                            return tslib_1.__spreadArray(tslib_1.__spreadArray([], p, true), [c], false);
                        }
                        return p;
                    }, []);
                    return [2 /*return*/, bids.map(function (e) { return ({ price: new bignumber_js_1.default(e.price), usdValue: new bignumber_js_1.default(e.volume) }); })];
            }
        });
    });
}
exports.getRateGarantex = getRateGarantex;
exports.testData = {
    timestamp: 1663943280,
    asks: [
        { price: "63.65", volume: "55735.47", amount: "3547562.67", factor: "0.114", type: "limit" },
        { price: "63.8", volume: "62283.46", amount: "3973684.75", factor: "0.116", type: "limit" },
        { price: "63.85", volume: "23433.61", amount: "1496236.0", factor: "0.117", type: "limit" },
        { price: "63.9", volume: "86.05", amount: "5498.6", factor: "0.118", type: "limit" },
    ],
    bids: [
        { price: "63.45", volume: "188585.23", amount: "11965733.04", factor: "0.11", type: "limit" },
        { price: "63.4", volume: "350147.27", amount: "22199336.6", factor: "0.109", type: "limit" },
        { price: "63.35", volume: "205209.16", amount: "13000000.0", factor: "0.108", type: "limit" },
        { price: "63.3", volume: "327412.1", amount: "20725185.94", factor: "0.108", type: "limit" },
        { price: "63.25", volume: "7686.15", amount: "486149.25", factor: "0.107", type: "limit" },
    ],
};
