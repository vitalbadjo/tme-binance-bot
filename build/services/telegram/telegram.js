"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.telegramService = void 0;
var tslib_1 = require("tslib");
var sheets_1 = require("../../arb/sheets");
var deniz_1 = require("../../arb/deniz");
var apis_1 = require("../../arb/apis");
var grtx_1 = require("../../arb/grtx");
var bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
var korona_api_1 = require("../../arb/korona/korona-api");
var keyboards_1 = require("./keyboards");
function telegramService(tmeApi, message) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _a, _b, startCalculationAmount, resultCalculationAmount, marginPercentage, rubtry, tryusdt, usdtrub, resultRub, replyMessage, _c, startAmountRub, resultRub, garantexRate, fees, koronaRate, margin, endRub, replyMessage;
        return tslib_1.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = message.text;
                    switch (_a) {
                        case "Deniz margin now": return [3 /*break*/, 1];
                        case "KoronaPay": return [3 /*break*/, 4];
                        case "SWIFT": return [3 /*break*/, 7];
                        case "Subscribe": return [3 /*break*/, 9];
                        case "Назад": return [3 /*break*/, 11];
                        case "Подписатся на Deniz": return [3 /*break*/, 13];
                        case "Подписатся на KoronaPay": return [3 /*break*/, 13];
                    }
                    return [3 /*break*/, 15];
                case 1: return [4 /*yield*/, getDenizCalculation()];
                case 2:
                    _b = _d.sent(), startCalculationAmount = _b.startCalculationAmount, resultCalculationAmount = _b.resultCalculationAmount, marginPercentage = _b.marginPercentage, rubtry = _b.rubtry, tryusdt = _b.tryusdt, usdtrub = _b.usdtrub, resultRub = _b.resultRub;
                    replyMessage = "<b>\u041C\u0430\u0440\u0436\u0430: ".concat(marginPercentage.toFormat(2).toString(), "%</b>\n").concat(resultRub.gt(0) ? "Прибыль" : "Убыток", ": ").concat(resultRub.toFormat(2).toString(), "\n\n\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u0430\u044F \u0441\u0443\u043C\u043C\u0430: ").concat(startCalculationAmount.amount, " ").concat(startCalculationAmount.currency, "\n\u041A\u043E\u043D\u0435\u0447\u043D\u0430\u044F \u0441\u0443\u043C\u043C\u0430: ").concat(resultCalculationAmount.amount, " ").concat(resultCalculationAmount.currency, "\n\u041A\u0443\u0440\u0441 RUB/TRY: ").concat(rubtry.toString(), " (DenizBank)\n\u041A\u0443\u0440\u0441 TRY/USDT: ").concat(tryusdt.toString(), " (Bitexen)\n\u041A\u0443\u0440\u0441 USDT/RUB: ").concat(usdtrub.toString(), " (Garantex)");
                    return [4 /*yield*/, getArbitrageResponse(tmeApi, message, replyMessage)];
                case 3:
                    _d.sent();
                    return [3 /*break*/, 17];
                case 4: return [4 /*yield*/, getKoronaCalculations()];
                case 5:
                    _c = _d.sent(), startAmountRub = _c.startAmountRub, resultRub = _c.resultRub, garantexRate = _c.garantexRate, fees = _c.fees, koronaRate = _c.koronaRate, margin = _c.margin, endRub = _c.endRub;
                    replyMessage = "<b>KoronaPay RUS --> TUR</b>\n<b>\u041C\u0430\u0440\u0436\u0430: ".concat(margin, "%</b>\n").concat(resultRub.gt(0) ? "Прибыль" : "Убыток", ": ").concat(resultRub.toFormat(2).toString(), "\n\n\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u0430\u044F \u0441\u0443\u043C\u043C\u0430: ").concat(startAmountRub, " RUB\n\u041A\u043E\u043D\u0435\u0447\u043D\u0430\u044F \u0441\u0443\u043C\u043C\u0430: ").concat(endRub.toString(), " RUB\n\u041A\u043E\u043C\u0438\u0441\u0441\u0438\u0438: ").concat(fees, "%\n\u041A\u0443\u0440\u0441 RUB/USD: ").concat(koronaRate, " (KoronaPay)\n\u041A\u0443\u0440\u0441 USDT/RUB: ").concat(garantexRate.toString(), " (Garantex)");
                    return [4 /*yield*/, getArbitrageResponse(tmeApi, message, replyMessage)];
                case 6:
                    _d.sent();
                    return [3 /*break*/, 17];
                case 7: return [4 /*yield*/, getArbitrageResponse(tmeApi, message, "resp for swift")];
                case 8:
                    _d.sent();
                    return [3 /*break*/, 17];
                case 9: return [4 /*yield*/, tmeApi.sendMessage(message.chat.id, "Chose subscription", {
                        parse_mode: "HTML",
                        reply_markup: keyboards_1.keyboards.subscriptions,
                    })];
                case 10:
                    _d.sent();
                    return [3 /*break*/, 17];
                case 11: return [4 /*yield*/, tmeApi.sendMessage(message.chat.id, "Chose option", {
                        parse_mode: "HTML",
                        reply_markup: keyboards_1.keyboards.initial,
                    })];
                case 12:
                    _d.sent();
                    return [3 /*break*/, 17];
                case 13: return [4 /*yield*/, tmeApi.sendMessage(message.chat.id, "Not implemented yet...", {
                        parse_mode: "HTML",
                        reply_markup: keyboards_1.keyboards.subscriptions,
                    })];
                case 14:
                    _d.sent();
                    return [3 /*break*/, 17];
                case 15: return [4 /*yield*/, getArbitrageResponse(tmeApi, message, "Chose option")];
                case 16:
                    _d.sent();
                    _d.label = 17;
                case 17: return [2 /*return*/];
            }
        });
    });
}
exports.telegramService = telegramService;
function getArbitrageResponse(tmeApi, reqMessage, resMessage) {
    if (resMessage === void 0) { resMessage = "Chose option"; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tmeApi.sendChatAction(reqMessage.chat.id, "typing")];
                case 1:
                    _a.sent();
                    return [2 /*return*/, tmeApi.sendMessage(reqMessage.chat.id, resMessage, {
                            parse_mode: "HTML",
                            reply_markup: keyboards_1.keyboards.initial,
                        })];
            }
        });
    });
}
function getDenizCalculation(startAmountRub) {
    if (startAmountRub === void 0) { startAmountRub = "1000000"; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var sheetDataRus, tinkoff, deniz, denizRate, bitexenRate, garantexRate, result;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, sheets_1.getPredefinedDataSheet)()];
                case 1:
                    sheetDataRus = _a.sent();
                    tinkoff = sheetDataRus.tinkoff, deniz = sheetDataRus.deniz;
                    return [4 /*yield*/, (0, deniz_1.getRatesDenizRubTry)()];
                case 2:
                    denizRate = _a.sent();
                    return [4 /*yield*/, (0, apis_1.getRatesBitexenUsdtLt)()];
                case 3:
                    bitexenRate = _a.sent();
                    return [4 /*yield*/, (0, grtx_1.getRateGarantex)()];
                case 4:
                    garantexRate = _a.sent();
                    result = new bignumber_js_1.default(startAmountRub)
                        .minus(new bignumber_js_1.default(tinkoff ? tinkoff.korrRub : "0"))
                        .minus(new bignumber_js_1.default(deniz ? deniz.korrRub : "0"))
                        .multipliedBy(denizRate)
                        .minus(new bignumber_js_1.default(deniz ? deniz.iban : "0"))
                        .dividedBy(bitexenRate)
                        .multipliedBy(new bignumber_js_1.default("1").minus(new bignumber_js_1.default(deniz ? deniz.dzh : "0").dividedBy(100)))
                        .multipliedBy(garantexRate[0].price);
                    return [2 /*return*/, {
                            startCalculationAmount: {
                                amount: startAmountRub,
                                currency: "RUB",
                            },
                            resultCalculationAmount: {
                                amount: result.toFormat(2).toString(),
                                currency: "RUB",
                            },
                            marginPercentage: result.dividedBy(startAmountRub).minus(1).multipliedBy(100),
                            rubtry: denizRate,
                            tryusdt: bitexenRate,
                            usdtrub: garantexRate[0].price,
                            resultRub: new bignumber_js_1.default(startAmountRub).minus(result),
                        }];
            }
        });
    });
}
function getKoronaCalculations() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _a, exchangeRate, sendRub, receiveUsd, _b, korona, turLocalExch, garantexRate, koronaOfficeFee, localCryptoExchangeFee, fees, resultUsdt, resultRub, resultMargin;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, korona_api_1.getRateKoronaPayFromRus)("TUR", "USD", "5000")];
                case 1:
                    _a = _c.sent(), exchangeRate = _a.exchangeRate, sendRub = _a.sendRub, receiveUsd = _a.receiveUsd;
                    return [4 /*yield*/, (0, sheets_1.getPredefinedDataSheet)()];
                case 2:
                    _b = _c.sent(), korona = _b.korona, turLocalExch = _b.turLocalExch;
                    return [4 /*yield*/, (0, grtx_1.getRateGarantex)()];
                case 3:
                    garantexRate = _c.sent();
                    koronaOfficeFee = new bignumber_js_1.default(korona ? korona.korrPercent : "0");
                    localCryptoExchangeFee = new bignumber_js_1.default(turLocalExch ? turLocalExch.korrPercent : "0");
                    fees = koronaOfficeFee.plus(localCryptoExchangeFee);
                    resultUsdt = receiveUsd.multipliedBy(new bignumber_js_1.default("1").minus(fees));
                    console.log("resultUsdt", resultUsdt.toString());
                    resultRub = resultUsdt.multipliedBy(garantexRate[0].price);
                    console.log("resultRub", resultRub.toString());
                    resultMargin = resultRub.dividedBy(sendRub).minus("1").multipliedBy(100);
                    return [2 /*return*/, {
                            startAmountRub: sendRub.toString(),
                            koronaRate: exchangeRate.toString(),
                            garantexRate: garantexRate[0].price.toString(),
                            fees: koronaOfficeFee.plus(localCryptoExchangeFee).multipliedBy(100).toString(),
                            margin: resultMargin.toFormat(2).toString(),
                            endRub: resultRub.toFormat(2),
                            resultRub: resultRub.minus(sendRub),
                        }];
            }
        });
    });
}
