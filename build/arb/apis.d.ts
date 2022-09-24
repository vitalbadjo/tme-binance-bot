import BigNumber from "bignumber.js";
export declare type CryptoAssets = "USDT" | "BTC";
export declare type FiatAssets = "RUB" | "USD" | "EUR" | "TRY";
export declare function getRatesParibuUsdtLt(): Promise<BigNumber>;
export declare function getRatesBitexenUsdtLt(): Promise<BigNumber>;
