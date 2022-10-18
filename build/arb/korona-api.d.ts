import BigNumber from "bignumber.js";
import { Currencies, CurrenciesData, KoronaPayCountryId } from "./korona.types";
export declare function getKoronaDirectionPoints(sendingCountryId?: KoronaPayCountryId, receivingMethod?: string): Promise<KoronaPayCountryId[]>;
export declare function getRateKoronaPayFromRus(receivingCountryId: KoronaPayCountryId, receivingCurrencyId: Currencies, receivingAmountWN?: string): Promise<{
    sendRub: BigNumber;
    receiveUsd: BigNumber;
}>;
export declare function getKoronaAcceptedReceivingCurrencies(sendingCountryId?: KoronaPayCountryId, receivingCountryId?: KoronaPayCountryId): Promise<CurrenciesData[]>;
