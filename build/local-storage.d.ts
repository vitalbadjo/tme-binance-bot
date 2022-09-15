import { RatesResponseSimple } from "./apis/binance-api";
declare type MarketCache = Record<string, RatesResponseSimple & {
    isDelivered: boolean;
    expired: boolean;
}>;
export declare class LocalStorage {
    triggerPercentage: number;
    users: string[];
    cachedMarketData: MarketCache;
    constructor(triggerPercentage: number);
    setUser(chatIds: string[]): void;
    getUsers(): string[];
    setDelivered(symbol: string): void;
    getMarketData(): Promise<MarketCache | undefined>;
}
export {};
