/// <reference types="node" />
import TelegramBot from "node-telegram-bot-api";
import { LocalStorage } from "../local-storage";
export declare function startPolling(tmeApi: TelegramBot, timeoutSecs: 1000, storage: LocalStorage): NodeJS.Timer;
