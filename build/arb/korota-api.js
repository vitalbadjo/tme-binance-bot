"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRateKoronaPayTurkUsd = exports.getRatesKoronaPay = exports.koronaConf = void 0;
var tslib_1 = require("tslib");
var axios_1 = tslib_1.__importDefault(require("axios"));
var config_1 = require("../config");
var bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
exports.koronaConf = {
    USD: 840,
    RUB: 810,
    TRY: 949,
};
function getRatesKoronaPay(_a) {
    var sendingCountryId = _a.sendingCountryId, sendingCurrencyId = _a.sendingCurrencyId, receivingCountryId = _a.receivingCountryId, receivingCurrencyId = _a.receivingCurrencyId, paymentMethod = _a.paymentMethod, receivingAmount = _a.receivingAmount, receivingMethod = _a.receivingMethod, paidNotificationEnabled = _a.paidNotificationEnabled;
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var response, data;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, axios_1.default.create().get("".concat(config_1.CONFIG.koronaPay.apiBaseUrl, "/transfers/online/api/transfers/tariffs?\n    sendingCountryId=").concat(sendingCountryId, "&\n\t\tsendingCurrencyId=").concat(sendingCurrencyId, "&\n\t\treceivingCountryId=").concat(receivingCountryId, "&\n\t\treceivingCurrencyId=").concat(receivingCurrencyId, "&\n\t\tpaymentMethod=").concat(paymentMethod, "&\n\t\treceivingAmount=").concat(receivingAmount, "&\n\t\treceivingMethod=").concat(receivingMethod, "&\n\t\tpaidNotificationEnabled=").concat(paidNotificationEnabled))];
                case 1:
                    response = _b.sent();
                    data = response.data;
                    // @ts-ignore
                    return [2 /*return*/, new bignumber_js_1.default(data).toString()];
            }
        });
    });
}
exports.getRatesKoronaPay = getRatesKoronaPay;
function getRateKoronaPayTurkUsd() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var response, data, _a, receivingAmount, sendingAmount;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, axios_1.default
                        .create()
                        .get("https://koronapay.com/transfers/online/api/transfers/tariffs?sendingCountryId=RUS&sendingCurrencyId=810&receivingCountryId=TUR&receivingCurrencyId=840&paymentMethod=debitCard&receivingAmount=480000&receivingMethod=cash&paidNotificationEnabled=true")];
                case 1:
                    response = _b.sent();
                    data = response.data;
                    _a = data[0], receivingAmount = _a.receivingAmount, sendingAmount = _a.sendingAmount;
                    return [2 /*return*/, {
                            sendRub: new bignumber_js_1.default(sendingAmount).dividedBy(100),
                            receiveUsd: new bignumber_js_1.default(receivingAmount).dividedBy(100),
                        }];
            }
        });
    });
}
exports.getRateKoronaPayTurkUsd = getRateKoronaPayTurkUsd;
//koronapay.com/transfers/online/api/transfers/tariffs?sendingCountryId=RUS&sendingCurrencyId=810&receivingCountryId=TUR&receivingCurrencyId=840&paymentMethod=debitCard&receivingAmount=100000&receivingMethod=cash&paidNotificationEnabled=true
