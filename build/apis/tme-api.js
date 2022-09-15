"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tmeApi = void 0;
var tslib_1 = require("tslib");
var node_telegram_bot_api_1 = tslib_1.__importDefault(require("node-telegram-bot-api"));
var utils_1 = require("../utils");
exports.tmeApi = new node_telegram_bot_api_1.default((0, utils_1.getEnv)("TLGRM_TKN"), { polling: true });
