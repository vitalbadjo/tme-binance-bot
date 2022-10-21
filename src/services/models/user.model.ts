import { User } from "node-telegram-bot-api"

export type UserModel = User & { chatId: number; subscriptions: string[] }
