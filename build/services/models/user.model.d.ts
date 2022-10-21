import { User } from "node-telegram-bot-api";
export declare type UserModel = User & {
    chatId: number;
    subscriptions: string[];
};
