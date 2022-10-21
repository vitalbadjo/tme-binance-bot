import { SendMessageOptions } from "node-telegram-bot-api";
declare type Keyboards = Record<"initial" | "subscriptions", SendMessageOptions["reply_markup"]>;
export declare type TelegramCommands = "Deniz margin now" | "SWIFT" | "KoronaPay" | "Subscribe" | "Подписатся на Deniz" | "Подписатся на KoronaPay" | "Назад";
declare type CommandsKeys = "DENIZ" | "SWIFT" | "KORONA" | "subscribe" | "subscribeDeniz" | "subscribeKorona" | "backToMain";
export declare const TELEGRAM: TelegramConfig;
declare type TelegramConfig = {
    commands: Record<CommandsKeys, TelegramCommands>;
};
export declare const keyboards: Keyboards;
export {};
