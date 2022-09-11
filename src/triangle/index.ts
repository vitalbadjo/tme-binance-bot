import { filterByCurrency } from "./utils"
import { CURRENCY_DELIMITER } from "../config"
import { BnbGetAssetsResponse, Triangles } from "./types"

/**
 *
 * get info from binance
 * get all prices
 * construct union array with prices and remove unused fields
 * make triangles(and permutate it) filtered from duplicates (concat string of pairs)
 * calc
 * trade higest!
 */
export function getTriangles(symbolsData: BnbGetAssetsResponse, filter?: string, exclude?: string[]): [string, string, string][] {
	const symbols: string[] = symbolsData.symbols
		.filter(e => e.isSpotTradingAllowed && e.status === "TRADING" && e.orderTypes.includes("MARKET") && e.permissions.includes("SPOT"))
		.map(e => addDelimiter(e.baseAsset, e.quoteAsset))
	return symbols.reduce<Triangles>((p, c, _, arr) => {
		const [currA, currB] = c.split(CURRENCY_DELIMITER)
		if (filter && currA !== filter && currB !== filter) {
			return p
		}

		if (exclude && (exclude.includes(currA) || exclude.includes(currB))) {
			return p
		}
		const { currency: baseA, filtered: filteredByA } = filterByCurrency(currA, arr)
		const { filtered: filteredByB } = filterByCurrency(currB, arr)
		filteredByA.forEach(ela => {
			const [aa, ab] = ela.split(CURRENCY_DELIMITER)
			if (aa === baseA) {
				filteredByB.forEach(elb => {
					const [ba, bb] = elb.split(CURRENCY_DELIMITER)
					if ((ba === ab || bb === ab) && compareTriangle(c, ela, elb)) {
						p = [...p, [c, ela, elb]]
					}
				})
			} else {
				filteredByB.forEach(elb => {
					const [ba, bb] = elb.split(CURRENCY_DELIMITER)
					if ((ba === aa || bb === aa) && compareTriangle(c, ela, elb)) {
						p = [...p, [c, ela, elb]]
					}
				})
			}
		})
		return p
	}, [])
}


function compareTriangle(a: string, b: string, c: string): boolean {
	return a !== b && b !== c && c !== a
}

function addDelimiter(a: string, b: string): string {
	return `${a}${CURRENCY_DELIMITER}${b}`
}

