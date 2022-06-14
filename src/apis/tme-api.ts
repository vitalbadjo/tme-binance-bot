import TelegramBot from "node-telegram-bot-api"
import { getEnv } from "../utils"
export const tmeApi = new TelegramBot(getEnv("TLGRM_TKN"), {polling: true})

