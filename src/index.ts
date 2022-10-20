import TelegramBot from "node-telegram-bot-api"
import { getEnv } from "./utils"
import { LocalStorage } from "./local-storage"
import { KEYBOARDS } from "./keyboards"
import * as dotenv from "dotenv"
dotenv.config()

/**
 * telegram functions
 */
let timer: NodeJS.Timer = {} as any
let timeoutSecs: number = 120
let storage: LocalStorage = new LocalStorage(2)

const tmeApi = new TelegramBot(getEnv("TLGRM_TKN"), { polling: true })
// db.authenticate().then(() => console.log("Connected to database")).catch(e => console.log(`DB connections error: ${e}`))
// db.sync().then()
tmeApi.setMyCommands([
  { command: "/start", description: "Подписатся на сигналы" },
  { command: "/test", description: "Тест вопросов ответов" },
])
tmeApi.on("message", async (message) => {
  console.log("message", message)
  if (message) {
    if (message.reply_to_message) {
      if (message.reply_to_message.message_id) {
        const replyMessageId = message.reply_to_message.message_id
        console.log("replyMessageId", replyMessageId)
      }
      // reply functions
    }
  }

  if (message.text === "/test") {
    const req = await tmeApi.sendMessage(message.chat.id, "Test", KEYBOARDS.digitalKeyboard)
    console.log("req.message_id", req.message_id)
    tmeApi.on("inline_query", (qmsg) => {
      console.log("qmsg", qmsg)
    })
    return req
  }
  if (message.text === "/start") {
    timer = startPolling()
    storage.setUser([message.chat.id.toString()])
    // await User.create({chatId: message.chat.id})
    return tmeApi.sendMessage(message.chat.id, "Congrats! Your subscription started")
  }
  if (message.text?.includes("new")) {
    storage = new LocalStorage(parseInt(message.text?.slice(3)))
  }
  if (message.text?.includes("time")) {
    clearInterval(timer)
    timeoutSecs = parseInt(message.text?.slice(4))
    timer = startPolling()
  }
  if (message.text === "stop") {
    clearInterval(timer)
    return tmeApi.sendMessage(message.chat.id, "Your subscription cancelled")
  }
  return tmeApi.sendMessage(message.chat.id, "Yes that's right")
})
async function getChats() {
  return storage.getUsers() // User.findAll()
}
function startPolling() {
  return setInterval(async () => {
    const chats = await getChats()
    if (chats.length) {
      const signals = await storage.getMarketData() //await getFeaturesSignals()
      //todo write in db
      // check if hawe new signals >> send
      if (signals) {
        if (Object.keys(signals).length) {
          chats.forEach((chatId) => {
            const message = Object.entries(signals)
              .filter(([, data]) => !data.isDelivered)
              .map(([symbol]) => {
                return `${symbol}: ${signals[symbol].priceChangePercent}%`
              })
              .join("\n")
            tmeApi.sendMessage(chatId, message).then(() => {
              Object.keys(signals).forEach((s) => {
                storage.setDelivered(s)
              })
            })
          })
        }
      }
    }
  }, timeoutSecs * 1000)
}

tmeApi.on("inline_query", async (msg) => {
  const data = msg.from
  console.log("data", data)
  const chatId = msg.query
  console.log("chatId", chatId)
})
