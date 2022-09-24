import BigNumber from "bignumber.js";
export declare function getRateGarantex(): Promise<{
    price: BigNumber;
    usdValue: BigNumber;
}[]>;
declare type GarantexMarketItem = {
    price: string;
    volume: string;
    amount: string;
    factor: string;
    type: string;
};
declare type RateGarantexResponse = {
    timestamp: number;
    asks: GarantexMarketItem[];
    bids: GarantexMarketItem[];
};
export declare const testData: RateGarantexResponse;
export {};
