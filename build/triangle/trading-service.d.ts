import { CalculatePredictionTradingProfit, DataWithPrices, TradingServiceResultTriangleSchema } from "./types";
/**
 * must have
 * can add base balanced pairs to trade
 * +have filter to exclude assets from analysis (on add prices step)
 * -get data from binance methods - may be private
 * +make public object with all pairs and prices - ok
 * get trading row with length declared in length parameter
 * calculate trading row (maybe in get trading row function)
 * print result data from trading row delimited with ";" for import in .csv
 *
 * more: refresh input pairs data from bnb endpoint and write to local variable
 */
export declare class TradingService {
    readonly priceRequestIntervalSec: number;
    readonly test: boolean;
    readonly depositedCurrencies: string[];
    readonly filterAssets: string[];
    priceRequestDate: number;
    dataWithPricesCache: DataWithPrices[];
    constructor(priceRequestIntervalSec: number, test?: boolean, depositedCurrencies?: string[], filterAssets?: string[]);
    getDataWithPrices(): Promise<DataWithPrices[]>;
    trade(data: TradingServiceResultTriangleSchema, test?: boolean): Promise<{
        predicateProfit: string;
        triangleString: string;
        realProfit: string;
    }>;
    calculateTriangleProfit(triangle: DataWithPrices[], baseAsset: string): CalculatePredictionTradingProfit | undefined;
    getRows(originList: DataWithPrices[], length?: number): TradingServiceResultTriangleSchema[];
}
export declare function alignToStepSize(price: string, stepSize: string): string;
