"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var node_telegram_bot_api_1 = tslib_1.__importDefault(require("node-telegram-bot-api"));
var utils_1 = require("./utils");
var local_storage_1 = require("./local-storage");
var keyboards_1 = require("./keyboards");
var dotenv = tslib_1.__importStar(require("dotenv"));
dotenv.config();
/**
 * telegram functions
 */
var timer = {};
var timeoutSecs = 120;
var storage = new local_storage_1.LocalStorage(2);
var tmeApi = new node_telegram_bot_api_1.default((0, utils_1.getEnv)("TLGRM_TKN"), { polling: true });
// db.authenticate().then(() => console.log("Connected to database")).catch(e => console.log(`DB connections error: ${e}`))
// db.sync().then()
tmeApi.setMyCommands([
    { command: "/start", description: "Подписатся на сигналы" },
    { command: "/test", description: "Тест вопросов ответов" },
]);
tmeApi.on("message", function (message) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var replyMessageId, req;
    var _a, _b, _c, _d;
    return tslib_1.__generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                console.log("message", message);
                if (message) {
                    if (message.reply_to_message) {
                        if (message.reply_to_message.message_id) {
                            replyMessageId = message.reply_to_message.message_id;
                            console.log("replyMessageId", replyMessageId);
                        }
                        // reply functions
                    }
                }
                if (!(message.text === "/test")) return [3 /*break*/, 2];
                return [4 /*yield*/, tmeApi.sendMessage(message.chat.id, "Test", keyboards_1.KEYBOARDS.digitalKeyboard)];
            case 1:
                req = _e.sent();
                console.log("req.message_id", req.message_id);
                tmeApi.on("inline_query", function (qmsg) {
                    console.log("qmsg", qmsg);
                });
                return [2 /*return*/, req];
            case 2:
                if (message.text === "/start") {
                    timer = startPolling();
                    storage.setUser([message.chat.id.toString()]);
                    // await User.create({chatId: message.chat.id})
                    return [2 /*return*/, tmeApi.sendMessage(message.chat.id, "Congrats! Your subscription started")];
                }
                if ((_a = message.text) === null || _a === void 0 ? void 0 : _a.includes("new")) {
                    storage = new local_storage_1.LocalStorage(parseInt((_b = message.text) === null || _b === void 0 ? void 0 : _b.slice(3)));
                }
                if ((_c = message.text) === null || _c === void 0 ? void 0 : _c.includes("time")) {
                    clearInterval(timer);
                    timeoutSecs = parseInt((_d = message.text) === null || _d === void 0 ? void 0 : _d.slice(4));
                    timer = startPolling();
                }
                if (message.text === "stop") {
                    clearInterval(timer);
                    return [2 /*return*/, tmeApi.sendMessage(message.chat.id, "Your subscription cancelled")];
                }
                return [2 /*return*/, tmeApi.sendMessage(message.chat.id, "Yes that's right")];
        }
    });
}); });
function getChats() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, storage.getUsers()]; // User.findAll()
        });
    });
}
function startPolling() {
    var _this = this;
    return setInterval(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var chats, signals_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getChats()];
                case 1:
                    chats = _a.sent();
                    if (!chats.length) return [3 /*break*/, 3];
                    return [4 /*yield*/, storage.getMarketData()
                        //todo write in db
                        // check if hawe new signals >> send
                    ]; //await getFeaturesSignals()
                case 2:
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
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); }, timeoutSecs * 1000);
}
tmeApi.on("inline_query", function (msg) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var data, chatId;
    return tslib_1.__generator(this, function (_a) {
        data = msg.from;
        console.log("data", data);
        chatId = msg.query;
        console.log("chatId", chatId);
        return [2 /*return*/];
    });
}); });
