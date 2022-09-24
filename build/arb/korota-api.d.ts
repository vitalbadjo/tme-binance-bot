import BigNumber from "bignumber.js";
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
declare type KoronaPayCountryId = "RUS" | "KGZ" | "AZE" | "MDA" | "KAZ" | "TJK" | "UZB" | "TUR" | "GEO" | "BLR" | "VNM" | "ISR" | "KOR";
export declare type KoronaPayPayMethod = "debitCard" | "cash";
export declare const koronaConf: {
    USD: number;
    RUB: number;
    TRY: number;
};
export declare function getRatesKoronaPay({ sendingCountryId, sendingCurrencyId, receivingCountryId, receivingCurrencyId, paymentMethod, receivingAmount, receivingMethod, paidNotificationEnabled, }: KoronaPayRequest): Promise<string>;
export declare function getRateKoronaPayTurkUsd(): Promise<{
    sendRub: BigNumber;
    receiveUsd: BigNumber;
}>;
declare type KoronaPayRequest = {
    sendingCountryId: "RUS";
    sendingCurrencyId: number;
    receivingCountryId: "TUR";
    receivingCurrencyId: number;
    paymentMethod: string;
    receivingAmount: number;
    receivingMethod: "cash";
    paidNotificationEnabled: boolean;
};
export {};
