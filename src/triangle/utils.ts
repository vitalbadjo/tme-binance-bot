import { CURRENCY_DELIMITER } from "../config"

export function filterByCurrency(currency: string, array: string[]): { currency: string, filtered: string[] } {
	return {
		currency,
		filtered: array.filter(el => {
			const [a, b] = el.split(CURRENCY_DELIMITER)
			return (a.search(currency) === 0 && a.length === currency.length) ||
				(b.search(currency) === 0 && b.length === currency.length)
		}),
	}
}

export function extractAllCurrencies(pairs: string[]): string[] {
	return pairs.reduce<string[]>((p, c) => {
		const [a, b] = c.split(CURRENCY_DELIMITER)
		if (!p.includes(a)) {
			return [...p, a]
		}
		if (!p.includes(b)) {
			return [...p, b]
		}
		return p
	}, [])
}

export function addDelimiter(bnbPair: string, allCurrencies: string[]): string {
	let delimitedPair: string = ""
	allCurrencies.forEach(el => {
		const pos = bnbPair.search(el)
		if (pos === 0) {
			delimitedPair = bnbPair.slice(0, el.length) + CURRENCY_DELIMITER + bnbPair.slice(el.length)
		}
		if (pos >= 0) {
			delimitedPair = bnbPair.slice(0, pos) + CURRENCY_DELIMITER + bnbPair.slice(pos)
		}
	})
	if (!delimitedPair.length) {
		throw new Error("Delimiter adding error")
	}
	return delimitedPair
}

export function removeDelimiter(pairsWithDelimiter: string[]): string[] {
	return pairsWithDelimiter.map(el => el.split(CURRENCY_DELIMITER).join(""))
}
