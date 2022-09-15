import { BnbGetAssetsResponse } from "./types";
/**
 *
 * get info from binance
 * get all prices
 * construct union array with prices and remove unused fields
 * make triangles(and permutate it) filtered from duplicates (concat string of pairs)
 * calc
 * trade higest!
 */
export declare function getTriangles(symbolsData: BnbGetAssetsResponse, filter?: string, exclude?: string[]): [string, string, string][];
