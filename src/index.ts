import TelegramBot from "node-telegram-bot-api"
import { getEnv } from "./utils"
import { LocalStorage } from "./local-storage"

const timer = startPolling()

const storage = new LocalStorage(3)

const tmeApi = new TelegramBot(getEnv("TLGRM_TKN"), {polling: true})
// db.authenticate().then(() => console.log("Connected to database")).catch(e => console.log(`DB connections error: ${e}`))
// db.sync().then()
tmeApi.on("message", async message => {
	if (message.text === "/start") {
		storage.setUser([message.chat.id.toString()])
		// await User.create({chatId: message.chat.id})
		return tmeApi.sendMessage(message.chat.id, "Congrats! Your subscription started")
	}
	if (message.text === "stop") {
		clearInterval(timer)
		return tmeApi.sendMessage(message.chat.id, "Your subscription cancelled")
	}
	return tmeApi.sendMessage(message.chat.id, "Yes that's right")
})
async function getChats() {
	return storage.getUsers()// User.findAll()
}
function startPolling() {
	return setInterval(async () => {
		const chats = await getChats()
		if (chats.length) {
			const signals = await storage.getMarketData()//await getFeaturesSignals()
			//todo write in db
			// check if hawe new signals >> send
			if (signals) {
				if (Object.keys(signals).length) {
					chats.forEach((chatId) => {
						const message = Object.entries(signals).filter(([, data]) => !data.isDelivered).map(([symbol]) => {
							return `${symbol}: ${signals[symbol].priceChangePercent}%`
						}).join("\n")
						tmeApi.sendMessage(chatId, message).then(() => {
							Object.keys(signals).forEach(s => {
								storage.setDelivered(s)
							})
						})
					})
				}
			}
		}
	}, 120*1000)
}

// async function getFeaturesSignals() {
// 	const rates = await getRates()
// 	return rates.filter(rate => parseInt(rate.priceChangePercent) >= 20)
// }
