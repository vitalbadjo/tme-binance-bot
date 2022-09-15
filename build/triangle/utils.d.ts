import { Triangles } from "./types";
export declare function filterByCurrency(currency: string, array: string[]): {
    currency: string;
    filtered: string[];
};
export declare function pairPouring(base: string, pairs: string[]): string[];
export declare function extractUniquePairs(triangles: Triangles): string[];
export declare function extractAllCurrencies(pairs: string[]): string[];
export declare function addDelimiter(bnbPair: string, allCurrencies: string[]): string;
export declare function removeDelimiter(pairsWithDelimiter: string[]): string[];
