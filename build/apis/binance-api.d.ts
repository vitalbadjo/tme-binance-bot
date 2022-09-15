import { BnbGetAssetsResponse } from "../triangle/types";
export declare type GetRatesResponse = {
    askPrice: string;
    askQty: string;
    bidPrice: string;
    bidQty: string;
    closeTime: number;
    count: number;
    firstId: number;
    highPrice: string;
    lastId: number;
    lastPrice: string;
    lastQty: string;
    lowPrice: string;
    openPrice: string;
    openTime: number;
    prevClosePrice: string;
    priceChange: string;
    priceChangePercent: string;
    quoteVolume: string;
    symbol: string;
    volume: string;
    weightedAvgPrice: string;
};
export declare type RatesResponseSimple = Pick<GetRatesResponse, "askPrice" | "symbol" | "priceChangePercent" | "priceChange">;
export declare function getRates(): Promise<GetRatesResponse[]>;
export declare function getSpotAssets(): Promise<BnbGetAssetsResponse>;
export declare type SpotRatesResponse = {
    symbol: string;
    price: string;
};
export declare function getSpotRatesAll(): Promise<SpotRatesResponse[]>;
export declare function getSpotRates(symbols: string[], test?: boolean): Promise<SpotRatesResponse[]>;
