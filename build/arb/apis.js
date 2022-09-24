"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRatesBitexenUsdtLt = exports.getRatesParibuUsdtLt = void 0;
var tslib_1 = require("tslib");
var axios_1 = tslib_1.__importDefault(require("axios"));
var config_1 = require("../config");
var bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
// const a: ParibuRatesResponse = {
//   success: true,
//   data: {
//     ticker: {
//       "usdt-tl": {
//         c: 18.568,
//         b: 18.568,
//         s: 18.57,
//         priceSeries: [
//           18.485, 18.485, 18.496, 18.501, 18.515, 18.515, 18.511, 18.526,
//         ],
//       },
//     },
//     config: {},
//     fbtoken: {},
//     prbcoin: {},
//     pizzabutton: false,
//     bannerContent: [],
//   },
// }
function getRatesParibuUsdtLt() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var response, data;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.create().get("".concat(config_1.CONFIG.paribu.apiBaseUrl, "/app/initials"))];
                case 1:
                    response = _a.sent();
                    data = response.data;
                    return [2 /*return*/, new bignumber_js_1.default(data.data.ticker["usdt-tl"].c)];
            }
        });
    });
}
exports.getRatesParibuUsdtLt = getRatesParibuUsdtLt;
function getRatesBitexenUsdtLt() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var response, data;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.create().get("".concat(config_1.CONFIG.bitexen.apiBaseUrl, "/ticker/USDTTRY/"))];
                case 1:
                    response = _a.sent();
                    data = response.data;
                    return [2 /*return*/, new bignumber_js_1.default(data.data.ticker.ask)];
            }
        });
    });
}
exports.getRatesBitexenUsdtLt = getRatesBitexenUsdtLt;
