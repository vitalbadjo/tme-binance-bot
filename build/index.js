"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
// import TelegramBot from "node-telegram-bot-api"
// import { getEnv } from "./utils"
// import { LocalStorage } from "./local-storage"
// import { KEYBOARDS } from "./keyboards"
// import { getSpotAssets } from "./apis/binance-api"
// import { getTriangles } from "./triangle"
var trading_service_1 = require("./triangle/trading-service");
var nikish_1 = require("./triangle/nikish");
// getSpotAssets().then(e => {
// 	console.log("Triangles: ", getTriangles(e))
// })
var timer = {};
timer = setInterval(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var tradingService, data, resultUsdt, resultUSDC, resultBNB, resultBUSD, resultBTC, resultETH, fs, resStringUsdt, resStringUsdc, resStringBnb, resStringBusd, resStringBtc, resStringEth;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                tradingService = new trading_service_1.TradingService(20, false, ["USDT", "USDC", "BUSD", "BNB", "ETH", "BTC"]);
                return [4 /*yield*/, tradingService.getDataWithPrices()];
            case 1:
                data = _a.sent();
                resultUsdt = tradingService.getTr(data, "USDT");
                resultUSDC = tradingService.getTr(data, "USDC");
                resultBNB = tradingService.getTr(data, "BNB");
                resultBUSD = tradingService.getTr(data, "BUSD");
                resultBTC = tradingService.getTr(data, "BTC");
                resultETH = tradingService.getTr(data, "ETH");
                fs = require('fs');
                resStringUsdt = resultUsdt.length ? "USDT;".concat(resultUsdt[0].triangleString, "; ").concat(resultUsdt[0].predicatedProfit.string, ";\n") : "";
                resStringUsdc = resultUSDC.length ? "USDC;".concat(resultUSDC[0].triangleString, "; ").concat(resultUSDC[0].predicatedProfit.string, ";\n") : "";
                resStringBnb = resultBNB.length ? "BNB;".concat(resultBNB[0].triangleString, "; ").concat(resultBNB[0].predicatedProfit.string, ";\n") : "";
                resStringBusd = resultBUSD.length ? "BUSD;".concat(resultBUSD[0].triangleString, "; ").concat(resultBUSD[0].predicatedProfit.string, ";\n") : "";
                resStringBtc = resultBTC.length ? "BTC;".concat(resultBTC[0].triangleString, "; ").concat(resultBTC[0].predicatedProfit.string, ";\n") : "";
                resStringEth = resultETH.length ? "ETH;".concat(resultETH[0].triangleString, "; ").concat(resultETH[0].predicatedProfit.string, ";\n") : "";
                console.log("result", resStringUsdt + resStringUsdc + resStringBnb + resStringBusd + resStringBtc + resStringEth);
                fs.writeFile('/root/test.txt', resStringUsdt + resStringUsdc + resStringBnb + resStringBusd + resStringBtc + resStringEth, { flag: 'a+' }, function (err) {
                    // fs.writeFile('/Users/vitaliyzhalnin/test.txt', resStringUsdt+resStringUsdc+resStringBnb+resStringBusd+resStringBtc+resStringEth, { flag: 'a+' }, (err: any) => {
                    if (err) {
                        console.error(err);
                    }
                    // file written successfully
                });
                return [2 /*return*/];
        }
    });
}); }, 5 * 1000);
console.log(timer);
console.log("cadesplugin", nikish_1.cadesplugin);
// let timeoutSecs: number = 120
// let storage: LocalStorage = new LocalStorage(2)
//
// const tmeApi = new TelegramBot(getEnv("TLGRM_TKN"), {polling: true})
// // db.authenticate().then(() => console.log("Connected to database")).catch(e => console.log(`DB connections error: ${e}`))
// // db.sync().then()
// tmeApi.setMyCommands([
// 	{command: '/start', description: 'Подписатся на сигналы'},
// 	{command: '/test', description: 'Тест вопросов ответов'},
// ])
// tmeApi.on("message", async message => {
// 	console.log("message", message)
// 	if (message) {
// 		if (message.reply_to_message) {
// 			if (message.reply_to_message.message_id) {
// 				const replyMessageId = message.reply_to_message.message_id
// 				console.log("replyMessageId", replyMessageId)
// 			}
// 			// reply functions
// 		}
// 	}
//
// 	if (message.text === "/test") {
// 		const req = await tmeApi.sendMessage(message.chat.id, "Test", KEYBOARDS.digitalKeyboard)
// 		console.log("req.message_id", req.message_id)
// 		tmeApi.on("inline_query", qmsg => {
// 			console.log("qmsg", qmsg)
// 		})
// 		return req
// 	}
// 	if (message.text === "/start") {
// 		timer = startPolling()
// 		storage.setUser([message.chat.id.toString()])
// 		// await User.create({chatId: message.chat.id})
// 		return tmeApi.sendMessage(message.chat.id, "Congrats! Your subscription started")
// 	}
// 	if (message.text?.includes("new")) {
// 		storage = new LocalStorage(parseInt(message.text?.slice(3)))
// 	}
// 	if (message.text?.includes("time")) {
// 		clearInterval(timer)
// 		timeoutSecs = parseInt(message.text?.slice(4))
// 		timer = startPolling()
// 	}
// 	if (message.text === "stop") {
// 		clearInterval(timer)
// 		return tmeApi.sendMessage(message.chat.id, "Your subscription cancelled")
// 	}
// 	return tmeApi.sendMessage(message.chat.id, "Yes that's right")
// })
// async function getChats() {
// 	return storage.getUsers()// User.findAll()
// }
// function startPolling() {
// 	return setInterval(async () => {
// 		const chats = await getChats()
// 		if (chats.length) {
// 			const signals = await storage.getMarketData()//await getFeaturesSignals()
// 			//todo write in db
// 			// check if hawe new signals >> send
// 			if (signals) {
// 				if (Object.keys(signals).length) {
// 					chats.forEach((chatId) => {
// 						const message = Object.entries(signals).filter(([, data]) => !data.isDelivered).map(([symbol]) => {
// 							return `${symbol}: ${signals[symbol].priceChangePercent}%`
// 						}).join("\n")
// 						tmeApi.sendMessage(chatId, message).then(() => {
// 							Object.keys(signals).forEach(s => {
// 								storage.setDelivered(s)
// 							})
// 						})
// 					})
// 				}
// 			}
// 		}
// 	}, timeoutSecs*1000)
// }
// tmeApi.on('inline_query', async msg => {
// 	const data = msg.from
// 	console.log("data", data)
// 	const chatId = msg.query
// 	console.log("chatId", chatId)
// })
