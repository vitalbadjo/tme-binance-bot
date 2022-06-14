import { getRates } from "./apis/binance-api"
import TelegramBot from "node-telegram-bot-api"
import { getEnv } from "./utils"

const timer = startPolling()

const tmeApi = new TelegramBot(getEnv("TLGRM_TKN"), {polling: true})

tmeApi.setMyCommands([
	{ command: "/start", description: "Start polling" },
	{ command: "/stopPolling", description: "Stop polling" },
])

tmeApi.on("message", async message => {
	if (message.text === "/start") {
		//todo chatId write in db
		return tmeApi.sendMessage(message.chat.id, "Congrats! Your subscription started")
	}
	if (message.text === "/stopPolling") {
		clearInterval(timer)
		// todo remove from DB
		return tmeApi.sendMessage(message.chat.id, "Your subscription cancelled")
	}
	return tmeApi.sendMessage(message.chat.id, "Yes that's right")
})
function getChats() {
	//todo get chats from db
	return []
}
function startPolling() {
	return setInterval(async () => {
		const chats = getChats()
		const signals = await getFeaturesSignals()
		//todo write in db
		// check if hawe new signals >> send
		if (signals.length) {
			chats.forEach((chatId) => {
				const message = signals.map(rate => {
					return `${rate.symbol}: ${rate.priceChangePercent}%`
				}).join("\n")
				tmeApi.sendMessage(chatId, message)
			})
		}
	}, 120*1000)
}

async function getFeaturesSignals() {
	const rates = await getRates()
	return rates.filter(rate => parseInt(rate.priceChangePercent) >= 20)
}
