import { FiatAssets } from "./apis";
export declare type KoronaGetDirectionPointsResponse = {
    country: {
        id: KoronaPayCountryId;
        code: string;
        name: string;
        phoneInfo: any;
    };
    forbidden: boolean;
}[];
export declare type GetKoronaAcceptedReceivingCurrenciesResponse = {
    maxReceivingAmount: number;
    minReceivingAmount: number;
    paymentMethod: KoronaPaymentMethod;
    receivingCurrency: CurrenciesData;
    receivingMethod: KoronaPaymentMethod;
    sendingCurrency: CurrenciesData;
}[];
export declare type KoronaPayCountryId = "RUS" | "KGZ" | "AZE" | "MDA" | "KAZ" | "TJK" | "UZB" | "TUR" | "GEO" | "BLR" | "VNM" | "ISR" | "KOR";
export declare type KoronaPayResponse = {
    sendingCurrency: {
        id: string;
        code: FiatAssets;
        name: string;
    };
    sendingAmount: number;
    sendingAmountDiscount: number;
    sendingAmountWithoutCommission: number;
    sendingCommission: number;
    sendingCommissionDiscount: number;
    sendingTransferCommission: number;
    paidNotificationCommission: number;
    receivingCurrency: {
        id: string;
        code: FiatAssets;
        name: string;
    };
    receivingAmount: number;
    exchangeRate: number;
    exchangeRateType: string;
    exchangeRateDiscount: number;
    profit: number;
    properties: {};
}[];
export declare type Currencies = "RUB" | "USD" | "UZS" | "EUR" | "KZT" | "BYN" | "AZN" | "KGS" | "GBP" | "CZK" | "PLN" | "SEK";
export declare type CurrenciesData = {
    id: string;
    code: string;
};
export declare type KoronaPaymentMethod = "cash" | "debitCard" | "creditCard";
export declare type KoronaPayDirectionsResponse = {
    country: {
        id: KoronaPayCountryId;
        code: string;
        name: string;
        phoneInfo: {
            prefix: string;
            minLength: number;
            maxLength: number;
            format: string;
        };
    };
    forbidden: boolean;
}[];
export declare const currencies: Record<Currencies, CurrenciesData>;
