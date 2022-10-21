"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var node_telegram_bot_api_1 = tslib_1.__importDefault(require("node-telegram-bot-api"));
var utils_1 = require("./utils");
var dotenv = tslib_1.__importStar(require("dotenv"));
var telegram_1 = require("./services/telegram/telegram");
var firebase_1 = require("./services/firebase");
dotenv.config();
var userService = new firebase_1.FirebaseService();
var tmeApi = new node_telegram_bot_api_1.default((0, utils_1.getEnv)("TLGRM_TKN"), { polling: true });
tmeApi.on("message", function (message) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var from, chat, userId, _a, _b, _c;
    return tslib_1.__generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                console.log("message", message);
                if (!(message.text === "/start")) return [3 /*break*/, 5];
                return [4 /*yield*/, tmeApi.setMyCommands([])];
            case 1:
                _d.sent();
                from = message.from, chat = message.chat;
                userId = from ? from.id : chat.id;
                _b = (_a = console).log;
                _c = ["start from : from"];
                return [4 /*yield*/, userService.getUser(userId)];
            case 2:
                _b.apply(_a, _c.concat([_d.sent()]));
                return [4 /*yield*/, userService.getUser(userId)];
            case 3:
                if (!!(_d.sent())) return [3 /*break*/, 5];
                if (!from) return [3 /*break*/, 5];
                return [4 /*yield*/, userService.addUser(tslib_1.__assign(tslib_1.__assign({}, from), { chatId: chat.id, subscriptions: [] }))];
            case 4:
                _d.sent();
                _d.label = 5;
            case 5: return [4 /*yield*/, (0, telegram_1.telegramService)(tmeApi, message)];
            case 6:
                _d.sent();
                return [2 /*return*/];
        }
    });
}); });
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
