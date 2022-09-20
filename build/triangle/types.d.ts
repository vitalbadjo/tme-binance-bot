import BigNumber from "bignumber.js";
export declare type ResponseSymbol = {
    "symbol": string;
    "status": string;
    "baseAsset": string;
    "baseAssetPrecision": number;
    "quoteAsset": string;
    "quotePrecision": number;
    "quoteAssetPrecision": number;
    "baseCommissionPrecision": number;
    "quoteCommissionPrecision": number;
    "orderTypes": string[];
    "icebergAllowed": boolean;
    "ocoAllowed": boolean;
    "quoteOrderQtyMarketAllowed": boolean;
    "allowTrailingStop": boolean;
    "cancelReplaceAllowed": boolean;
    "isSpotTradingAllowed": boolean;
    "isMarginTradingAllowed": boolean;
    "filters": ({
        "filterType": "PRICE_FILTER";
        "minPrice": string;
        "maxPrice": string;
        "tickSize": string;
    } | {
        "filterType": "PERCENT_PRICE";
        "multiplierUp": string;
        "multiplierDown": string;
        "avgPriceMins": 5;
    } | {
        "filterType": "LOT_SIZE";
        "minQty": string;
        "maxQty": string;
        "stepSize": string;
    } | {
        "filterType": "MIN_NOTIONAL";
        "minNotional": string;
        "applyToMarket": true;
        "avgPriceMins": number;
    } | {
        "filterType": "ICEBERG_PARTS";
        "limit": number;
    } | {
        "filterType": "MARKET_LOT_SIZE";
        "minQty": string;
        "maxQty": string;
        "stepSize": string;
    } | {
        "filterType": string;
        "minTrailingAboveDelta": number;
        "maxTrailingAboveDelta": number;
        "minTrailingBelowDelta": number;
        "maxTrailingBelowDelta": number;
    } | {
        "filterType": string;
        "maxNumOrders": number;
    } | {
        "filterType": string;
        "maxNumAlgoOrders": number;
    } | {
        "filterType": "MAX_POSITION";
        "maxPosition": string;
    } | {
        "filterType": "PERCENT_PRICE_BY_SIDE";
        "bidMultiplierUp": string;
        "bidMultiplierDown": string;
        "askMultiplierUp": string;
        "askMultiplierDown": string;
        "avgPriceMins": number;
    })[];
    "permissions": string[];
};
export declare type BnbGetAssetsResponse = {
    timezone: string;
    serverTime: number;
    rateLimits: any[];
    exchangeFilters: any[];
    symbols: ResponseSymbol[];
};
export declare type Triangle = [string, string, string];
export declare type Triangles = Triangle[];
export declare type CalculatedRate = {
    triangle: Triangle;
    profit: string;
};
export declare type TradeActionType = "BUY" | "SELL";
export declare type DataWithPrices = {
    baseAsset: string;
    quoteAsset: string;
    symbol: string;
    price: string;
    stepSizeQuote: string;
    stepSizeBase: string;
};
export declare type TradingServiceResultTriangleSchema = {
    triangleString: string;
    triangleData: DataWithPrices[];
    predicatedProfit: {
        string: string;
        bn: BigNumber;
    };
    additionalPair?: DataWithPrices;
};
declare type CalculatedSinglePairInfo = {
    action: TradeActionType;
    pairName: string;
};
export declare type CalculatePredictionTradingProfit = {
    profitString: string;
    profit: BigNumber;
    pairs: DataWithPrices[];
    pair1?: CalculatedSinglePairInfo;
    pair2?: CalculatedSinglePairInfo;
    pair3?: CalculatedSinglePairInfo;
};
/**
 * YFIUSDT YFIEUR YFIBTC BTCEUR YFIUSDT
 */
export declare type SeparatedByAssets = Record<string, DataWithPrices[]>;
export {};
