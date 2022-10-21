import { SendMessageOptions } from "node-telegram-bot-api"

type Keyboards = Record<"initial" | "subscriptions", SendMessageOptions["reply_markup"]>
export type TelegramCommands =
  | "Deniz margin now"
  | "SWIFT"
  | "KoronaPay"
  | "Subscribe"
  | "Подписатся на Deniz"
  | "Подписатся на KoronaPay"
  | "Назад"
type CommandsKeys = "DENIZ" | "SWIFT" | "KORONA" | "subscribe" | "subscribeDeniz" | "subscribeKorona" | "backToMain"
export const TELEGRAM: TelegramConfig = {
  commands: {
    DENIZ: "Deniz margin now",
    SWIFT: "SWIFT",
    KORONA: "KoronaPay",
    subscribe: "Subscribe",
    subscribeDeniz: "Подписатся на Deniz",
    subscribeKorona: "Подписатся на KoronaPay",
    backToMain: "Назад",
  },
}
type TelegramConfig = {
  commands: Record<CommandsKeys, TelegramCommands>
}

export const keyboards: Keyboards = {
  initial: {
    keyboard: [
      [{ text: TELEGRAM.commands.DENIZ }],
      [{ text: TELEGRAM.commands.SWIFT }],
      [{ text: TELEGRAM.commands.KORONA }],
      [{ text: TELEGRAM.commands.subscribe }],
    ],
  },
  subscriptions: {
    keyboard: [
      [{ text: TELEGRAM.commands.subscribeDeniz }, { text: TELEGRAM.commands.subscribeKorona }],
      [{ text: TELEGRAM.commands.backToMain }],
    ],
  },
}
