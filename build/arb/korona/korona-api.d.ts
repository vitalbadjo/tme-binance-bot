import BigNumber from "bignumber.js";
import { Currencies, CurrenciesData, KoronaPayCountryId, KoronaPaymentMethod } from "./korona.types";
export declare function getKoronaDirectionPoints(sendingCountryId?: KoronaPayCountryId, receivingMethod?: KoronaPaymentMethod): Promise<KoronaPayCountryId[]>;
export declare function getRateKoronaPayFromRus(receivingCountryId: KoronaPayCountryId, receivingCurrencyId: Currencies, receivingAmountWN?: string): Promise<{
    sendRub: BigNumber;
    receiveUsd: BigNumber;
    exchangeRate: BigNumber;
}>;
export declare function getKoronaAcceptedReceivingCurrencies(sendingCountryId?: KoronaPayCountryId, receivingCountryId?: KoronaPayCountryId): Promise<CurrenciesData[]>;
