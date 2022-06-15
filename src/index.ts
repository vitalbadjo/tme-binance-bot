import { getRates } from "./apis/binance-api"
import TelegramBot from "node-telegram-bot-api"
import { getEnv } from "./utils"
import { db, User } from "./db"

const timer = startPolling()

const tmeApi = new TelegramBot(getEnv("TLGRM_TKN"), {polling: true})
db.authenticate().then(() => console.log("Connected to database")).catch(e => console.log(`DB connections error: ${e}`))
db.sync().then()
tmeApi.on("message", async message => {
	if (message.text === "/start") {
		await User.create({chatId: message.chat.id})
		return tmeApi.sendMessage(message.chat.id, "Congrats! Your subscription started")
	}
	if (message.text === "stop") {
		clearInterval(timer)
		return tmeApi.sendMessage(message.chat.id, "Your subscription cancelled")
	}
	return tmeApi.sendMessage(message.chat.id, "Yes that's right")
})
async function getChats() {
	return  User.findAll()
}
function startPolling() {
	return setInterval(async () => {
		const chats = await getChats()
		if (chats.length) {
			const signals = await getFeaturesSignals()
			//todo write in db
			// check if hawe new signals >> send
			if (signals.length) {
				chats.forEach((chatId) => {
					const message = signals.map(rate => {
						return `${rate.symbol}: ${rate.priceChangePercent}%`
					}).join("\n")
					tmeApi.sendMessage(chatId.getDataValue("chatId"), message)
				})
			}
		}
	}, 120*1000)
}

async function getFeaturesSignals() {
	const rates = await getRates()
	return rates.filter(rate => parseInt(rate.priceChangePercent) >= 20)
}
