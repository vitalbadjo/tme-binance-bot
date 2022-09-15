import BigNumber from "bignumber.js";
import { TradeActionType } from "./calculate-rates";
export declare type DataWithPrices = {
    baseAsset: string;
    quoteAsset: string;
    symbol: string;
    price: string;
};
export declare type TradingServiceTriangle = [DataWithPrices, DataWithPrices, DataWithPrices];
export declare type TradingServiceResultTriangleSchema = {
    triangleString: string;
    triangleData: DataWithPrices[];
    predicatedProfit: {
        string: string;
        bn: BigNumber;
    };
    additionalPair?: DataWithPrices;
};
export declare class TradingService {
    readonly priceRequestIntervalSec: number;
    readonly test: boolean;
    readonly depositedCurrencies: string[];
    priceRequestDate: number;
    dataWithPricesCache: DataWithPrices[];
    constructor(priceRequestIntervalSec: number, test?: boolean, depositedCurrencies?: string[]);
    private filterByCurrency;
    compareTriangle(a: string, b: string, c: string): boolean;
    getDataWithPrices(): Promise<DataWithPrices[]>;
    getTrianglesData(): Promise<TradingServiceResultTriangleSchema[]>;
    isBase(pair: DataWithPrices, asset: string): boolean;
    trade(data: TradingServiceResultTriangleSchema): Promise<{
        predicateProfit: string;
        triangleString: string;
        realProfit: string;
    }>;
    searchAdditionalPair(dataWithPrices: DataWithPrices[], triangle: DataWithPrices[]): DataWithPrices | undefined;
    getTypeOfDeal(assetToBuy: string, pair: string): TradeActionType;
    getOtherAsset(pair: string, asset: string): string;
    calculateTriangleProfit(triangle: DataWithPrices[]): CalculatePredictionTradingProfit | undefined;
    reshuffleTriangle(triangle: TradingServiceTriangle): {
        triangleData: DataWithPrices[];
        depositAsset: string;
    };
    getTr(originList: DataWithPrices[], baseAsset: string): TradingServiceResultTriangleSchema[];
}
declare type CalculatedSinglePairInfo = {
    action: TradeActionType;
    pairName: string;
};
declare type CalculatePredictionTradingProfit = {
    profitString: string;
    profit: BigNumber;
    pairs: DataWithPrices[];
    pair1?: CalculatedSinglePairInfo;
    pair2?: CalculatedSinglePairInfo;
    pair3?: CalculatedSinglePairInfo;
};
export declare function getTwoPairsFromTwoBases(firstPair: DataWithPrices, secondPair: DataWithPrices, base: string): [string, string];
export {};
