import TelegramBot from "node-telegram-bot-api"
import { LocalStorage } from "../local-storage"

export function startPolling(tmeApi: TelegramBot, timeoutSecs: 1000, storage: LocalStorage) {
  return setInterval(async () => {
    const chats: string[] = [] //getChats
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
