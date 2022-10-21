"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPolling = void 0;
var tslib_1 = require("tslib");
function startPolling(tmeApi, timeoutSecs, storage) {
    var _this = this;
    return setInterval(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var chats, signals_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    chats = [] //getChats
                    ;
                    if (!chats.length) return [3 /*break*/, 2];
                    return [4 /*yield*/, storage.getMarketData()
                        //todo write in db
                        // check if hawe new signals >> send
                    ]; //await getFeaturesSignals()
                case 1:
                    signals_1 = _a.sent() //await getFeaturesSignals()
                    ;
                    //todo write in db
                    // check if hawe new signals >> send
                    if (signals_1) {
                        if (Object.keys(signals_1).length) {
                            chats.forEach(function (chatId) {
                                var message = Object.entries(signals_1)
                                    .filter(function (_a) {
                                    var data = _a[1];
                                    return !data.isDelivered;
                                })
                                    .map(function (_a) {
                                    var symbol = _a[0];
                                    return "".concat(symbol, ": ").concat(signals_1[symbol].priceChangePercent, "%");
                                })
                                    .join("\n");
                                tmeApi.sendMessage(chatId, message).then(function () {
                                    Object.keys(signals_1).forEach(function (s) {
                                        storage.setDelivered(s);
                                    });
                                });
                            });
                        }
                    }
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); }, timeoutSecs * 1000);
}
exports.startPolling = startPolling;
