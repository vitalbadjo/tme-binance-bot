import { SpotRatesResponse } from "../apis/binance-api";
import { Triangle } from "./types";
import BigNumber from "bignumber.js";
export declare function calculateRates(test?: boolean): Promise<CalculatedSingleTriangle[]>;
export declare type CalcSinglePrepareTriangleWithPriceAndCurr = {
    symbol: string;
    price: string;
    firstCurr: string;
    secondCurr: string;
};
export declare type TradeActionType = "BUY" | "SELL";
export declare type PairAndPriceObject = {
    pairName: string;
    amount: BigNumber;
};
declare type CalculatedSinglePairInfo = {
    action: TradeActionType;
    pairName: string;
};
declare type CalculatedSingleTriangle = {
    pairs: [string, string, string];
    profitPercentString: string;
    profitPercent: BigNumber;
    pair1: CalculatedSinglePairInfo;
    pair2: CalculatedSinglePairInfo;
    pair3: CalculatedSinglePairInfo;
};
export declare function calcSingle(triangle: Triangle, prices: SpotRatesResponse[]): CalculatedSingleTriangle;
declare type PairTradingSchema = {
    action: TradeActionType;
};
export declare type TriangleTradingSchema = {
    pair1: PairTradingSchema;
    pair2: PairTradingSchema;
    pair3: PairTradingSchema;
};
export declare function permutateTriangle(triangle: CalcSinglePrepareTriangleWithPriceAndCurr[]): CalcSinglePrepareTriangleWithPriceAndCurr[];
export {};
