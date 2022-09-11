import { getTriangles } from "./index"
import { bnbInfoData } from "./fakeData/data"
import { extractUniquePairs } from "./utils"
import { getSpotRates, SpotRatesResponse } from "../apis/binance-api"
import { Triangle } from "./types"
import { BASE_CURRENCY_AMOUNT_FOR_CALCULATING, CURRENCY_DELIMITER } from "../config"
import BigNumber from "bignumber.js"

export async function calculateRates(test: boolean = false): Promise<CalculatedSingleTriangle[]> {
	const triangles = getTriangles(bnbInfoData)
	const pairs = extractUniquePairs(triangles)
	const prices = await getSpotRates(pairs, test)
	const raw = triangles.map(el => {
		return calcSingle(el, prices)
	})
	return uniqBy(raw, it => it.pair1.pairName)
}

// type Unpacked<T> = T extends (infer U)[] ? U : T
function uniqBy(a: CalculatedSingleTriangle[], key: (x: CalculatedSingleTriangle) => {}) {
	let seen = new Set();
	return a.filter(item => {
		let k = key(item);
		return seen.has(k) ? false : seen.add(k);
	});
}

export type CalcSinglePrepareTriangleWithPriceAndCurr = {
	symbol: string
	price: string
	firstCurr: string
	secondCurr: string
}

export type TradeActionType = "BUY" | "SELL"
export type PairAndPriceObject = { pairName: string, amount: BigNumber }

type CalculatedSinglePairInfo = {
	action: TradeActionType
	pairName: string
}

type CalculatedSingleTriangle = {
	pairs: [string, string, string],
	profitPercentString: string,
	profitPercent: BigNumber,
	pair1: CalculatedSinglePairInfo,
	pair2: CalculatedSinglePairInfo,
	pair3: CalculatedSinglePairInfo,
}

export function calcSingle(triangle: Triangle, prices: SpotRatesResponse[]): CalculatedSingleTriangle {
	const trianglePrices = prices.reduce<CalcSinglePrepareTriangleWithPriceAndCurr[]>((p,c) => {
		if (triangle.includes(c.symbol)) {
			const [firstCurr, secondCurr] = c.symbol.split(CURRENCY_DELIMITER)
			return [...p, {
				symbol: c.symbol,
				price: c.price,
				firstCurr,
				secondCurr
			}]
		}
		return p
	}, [])
	if (trianglePrices.length !== 3) {
		throw new Error("Not found all prices in calcSingle function")
	}
	let [pair1, pair2, pair3] = permutateTriangle(trianglePrices)


	const baseCurrency: PairAndPriceObject = {
		pairName: pair1.secondCurr,
		amount: new BigNumber(BASE_CURRENCY_AMOUNT_FOR_CALCULATING),
	}
	//buy first for second
	const secondCurrency: PairAndPriceObject = {
		pairName: pair1.firstCurr,
		amount: baseCurrency.amount.dividedBy(new BigNumber(pair1.price)),
	}
	//sell first for third
	const thirdCurrency: PairAndPriceObject = {
		pairName: pair2.secondCurr,
		amount: secondCurrency.amount.multipliedBy(new BigNumber(pair2.price))
	}
	let newBaseCurrAmount: BigNumber
	let pair3Action: TradeActionType
	// buy first for third
	if (pair2.secondCurr === pair3.firstCurr) {
		newBaseCurrAmount = thirdCurrency.amount.multipliedBy(new BigNumber(pair3.price))
		pair3Action = "SELL"
	} else {
		newBaseCurrAmount = thirdCurrency.amount.dividedBy(new BigNumber(pair3.price))
		pair3Action = "BUY"
	}
	const profit = newBaseCurrAmount.dividedBy(baseCurrency.amount).minus(1).multipliedBy(100)
	return {
		profitPercentString: profit.toString(),
		profitPercent: profit,
		pairs: [pair1.symbol, pair2.symbol, pair3.symbol],
		pair1: {
			pairName: pair1.symbol,
			action: "BUY"
		},
		pair2: {
			pairName: pair2.symbol,
			action: "SELL"
		},
		pair3: {
			pairName: pair3.symbol,
			action: pair3Action
		}
	}
}

type PairTradingSchema = {
	action: TradeActionType
}

export type TriangleTradingSchema = {
	pair1: PairTradingSchema
	pair2: PairTradingSchema
	pair3: PairTradingSchema
}
export function permutateTriangle(triangle: CalcSinglePrepareTriangleWithPriceAndCurr[]):CalcSinglePrepareTriangleWithPriceAndCurr[] {
		const [pair1, pair2, pair3] = triangle
		const [p1c1, p1c2] = pair1.symbol.split(CURRENCY_DELIMITER)
		const [p2c1, p2c2] = pair2.symbol.split(CURRENCY_DELIMITER)
		const [p3c1] = pair3.symbol.split(CURRENCY_DELIMITER)
		if (p1c1 === p2c1) {
			if (p1c2 === p3c1) {
				return [pair2, pair1, pair3]
			} else {
				return [pair1, pair2, pair3]
			}
		} else if (p1c1 === p3c1) {
			if (p1c2 === p2c1) {
				return [pair3, pair1, pair2]
			} else {
				return [pair1, pair3, pair2]
			}
		} else if (p2c1 === p3c1) {
			if (p2c2 === p1c1) {
				return [pair3, pair2, pair1]
			} else {
				return [pair2, pair3, pair1]
			}
		} else {
			return [pair1, pair2, pair3]
		}
}
