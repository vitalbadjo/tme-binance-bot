import TelegramBot from "node-telegram-bot-api"
import { getEnv } from "./utils"
import * as dotenv from "dotenv"
import { telegramService } from "./services/telegram/telegram"
import { FirebaseService } from "./services/firebase"
dotenv.config()

const userService = new FirebaseService()

const tmeApi = new TelegramBot(getEnv("TLGRM_TKN"), { polling: true })

tmeApi.on("message", async (message) => {
  console.log("message", message)
  if (message.text === "/start") {
    await tmeApi.setMyCommands([])
    const { from, chat } = message
    const userId = from ? from.id : chat.id
    console.log("start from : from", await userService.getUser(userId))
    if (!(await userService.getUser(userId))) {
      if (from) {
        await userService.addUser({ ...from, chatId: chat.id, subscriptions: [] })
      }
    }
  }
  await telegramService(tmeApi, message)
})

tmeApi.on("inline_query", async (msg) => {
  const data = msg.from
  console.log("data", data)
  const chatId = msg.query
  console.log("chatId", chatId)
})
