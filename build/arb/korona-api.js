"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKoronaAcceptedReceivingCurrencies = exports.getRateKoronaPayFromRus = exports.getKoronaDirectionPoints = void 0;
var tslib_1 = require("tslib");
var axios_1 = tslib_1.__importDefault(require("axios"));
var config_1 = require("../config");
var bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
var korona_types_1 = require("./korona.types");
// /transfers/directions/points/receiving?sendingCountryId=RUS&receivingMethod=cash
function getKoronaDirectionPoints(sendingCountryId, receivingMethod) {
    if (sendingCountryId === void 0) { sendingCountryId = "RUS"; }
    if (receivingMethod === void 0) { receivingMethod = "cash"; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var response, data;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default
                        .create()
                        .get("".concat(config_1.CONFIG.koronaPay.apiBaseUrl, "/transfers/directions/points/receiving?sendingCountryId=").concat(sendingCountryId, "&receivingMethod=").concat(receivingMethod))];
                case 1:
                    response = _a.sent();
                    data = response.data;
                    return [2 /*return*/, data.map(function (c) { return c.country.id; })];
            }
        });
    });
}
exports.getKoronaDirectionPoints = getKoronaDirectionPoints;
// /transfers/tariffs?sendingCountryId=RUS&sendingCurrencyId=810&receivingCountryId=TUR&receivingCurrencyId=840&paymentMethod=debitCard&receivingAmount=480000&receivingMethod=cash&paidNotificationEnabled=true
function getRateKoronaPayFromRus(receivingCountryId, receivingCurrencyId, receivingAmountWN) {
    if (receivingAmountWN === void 0) { receivingAmountWN = "4800"; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var response, data, _a, receivingAmount, sendingAmount;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, axios_1.default
                        .create()
                        .get("".concat(config_1.CONFIG.koronaPay.apiBaseUrl, "/transfers/tariffs?sendingCountryId=RUS&sendingCurrencyId=810&receivingCountryId=").concat(receivingCountryId, "&receivingCurrencyId=").concat(korona_types_1.currencies[receivingCurrencyId].id, "&paymentMethod=debitCard&receivingAmount=").concat(receivingAmountWN, "00&receivingMethod=cash&paidNotificationEnabled=false"))];
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
exports.getRateKoronaPayFromRus = getRateKoronaPayFromRus;
// https://koronapay.com/transfers/online/api/transfers/tariffs/info?receivingCountryId=TUR&sendingCountryId=RUS
function getKoronaAcceptedReceivingCurrencies(sendingCountryId, receivingCountryId) {
    if (sendingCountryId === void 0) { sendingCountryId = "RUS"; }
    if (receivingCountryId === void 0) { receivingCountryId = "TUR"; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var response, data;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default
                        .create()
                        .get("".concat(config_1.CONFIG.koronaPay.apiBaseUrl, "/transfers/tariffs/info?receivingCountryId=").concat(receivingCountryId, "&sendingCountryId=").concat(sendingCountryId))];
                case 1:
                    response = _a.sent();
                    data = response.data;
                    return [2 /*return*/, data.filter(function (e) { return e.receivingMethod === "cash"; }).map(function (e) { return e.receivingCurrency; })];
            }
        });
    });
}
exports.getKoronaAcceptedReceivingCurrencies = getKoronaAcceptedReceivingCurrencies;
