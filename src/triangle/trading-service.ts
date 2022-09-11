import { bnbInfoData } from "./fakeData/data"
import { BASE_CURRENCY_AMOUNT_FOR_CALCULATING } from "../config"
import BigNumber from "bignumber.js"
import {
	PairAndPriceObject,
	TradeActionType,
} from "./calculate-rates"
import { priceData } from "./fakeData/priceData"
import { getSpotRatesAll } from "../apis/binance-api"

export type DataWithPrices = {
	baseAsset: string
	quoteAsset: string
	symbol: string
	price: string
}
export type TradingServiceTriangle = [DataWithPrices, DataWithPrices, DataWithPrices]

export type TradingServiceResultTriangleSchema = {
	triangleString: string
	triangleData: TradingServiceTriangle
	predicatedProfit: {
		string: string,
		bn: BigNumber
	}
}

export class TradingService {
	priceRequestDate: number = 0
	constructor(
		readonly priceRequestIntervalSec: number,
		readonly test: boolean = false
	) {
		this.priceRequestIntervalSec = priceRequestIntervalSec
	}
	private filterByCurrency(currency: string, array: DataWithPrices[]): { currency: string, filtered: DataWithPrices[] } {
		return {
			currency,
			filtered: array.filter(el => {
				const {baseAsset, quoteAsset} = el
				return (baseAsset.search(currency) === 0 && baseAsset.length === currency.length) ||
					(quoteAsset.search(currency) === 0 && quoteAsset.length === currency.length)
			}),
		}
	}

	compareTriangle(a: string, b: string, c: string): boolean {
		return a !== b && b !== c && c !== a
	}

	async getTrianglesData(): Promise<TradingServiceResultTriangleSchema[]> {
		if ((this.priceRequestIntervalSec*1000 + this.priceRequestDate) > new Date().getTime()) {
			throw new Error("Prise request interval doesnt out")
		}
		this.priceRequestDate = new Date().getTime()
		const prices = this.test ? priceData : await getSpotRatesAll()// now takes 2-3 seconds that is too much...
		const dataWithPrices: DataWithPrices[] = bnbInfoData.symbols
			.filter(e => e.isSpotTradingAllowed && e.status === "TRADING" && e.orderTypes.includes("MARKET") && e.permissions.includes("SPOT"))
			.map(e => {
				const { baseAsset, quoteAsset, symbol } = e
				return {
					baseAsset,
					quoteAsset,
					symbol,
					price: prices.find(el => el.symbol === symbol)!.price
				}
			})

		return dataWithPrices.reduce<TradingServiceResultTriangleSchema[]>((p, c, _, arr) => {
			const { baseAsset, quoteAsset} = c

			const { currency: baseA, filtered: filteredByA } = this.filterByCurrency(baseAsset, arr)
			const { filtered: filteredByB } = this.filterByCurrency(quoteAsset, arr)
			filteredByA.forEach(ela => {
				const {baseAsset: aa, quoteAsset: ab} = ela
				if (aa === baseA) {
					filteredByB.forEach(elb => {
						const {baseAsset: ba, quoteAsset: bb} = elb
						if ((ba === ab || bb === ab) && this.compareTriangle(c.symbol, ela.symbol, elb.symbol)) {
							const triangleData = reshuffleTriangle([c, ela, elb])
							const triangleString = `${triangleData[0].symbol}${triangleData[1].symbol}${triangleData[2].symbol}`
							if (!p.find(el => el.triangleString === triangleString)) {
								const calc = calculateTriangleProfit(triangleData)
								if (calc.profit.gt(0)) {
									p = [
										...p,
										{triangleString, triangleData, predicatedProfit: {string: calc.profitString, bn: calc.profit}}
									]
								}
							}
						}
					})
				} else {
					filteredByB.forEach(elb => {
						const {baseAsset: ba, quoteAsset: bb} = elb
						if ((ba === aa || bb === aa) && this.compareTriangle(c.symbol, ela.symbol, elb.symbol)) {
							const triangleData = reshuffleTriangle([c, ela, elb])
							const triangleString = `${triangleData[0].symbol}${triangleData[1].symbol}${triangleData[2].symbol}`
							if (!p.find(el => el.triangleString === triangleString)) {
								const calc = calculateTriangleProfit(triangleData)
								if (calc.profit.gt(0)) {
									p = [
										...p,
										{triangleString, triangleData, predicatedProfit: {string: calc.profitString, bn: calc.profit}}
									]
								}
							}
						}
					})
				}
			})
			return p
		}, []).sort((a,b) => b.predicatedProfit.bn.toNumber() - a.predicatedProfit.bn.toNumber())
	}
}

export function reshuffleTriangle(triangle: TradingServiceTriangle): TradingServiceTriangle {
	const [pair1, pair2, pair3] = triangle
	const {baseAsset: p1c1, quoteAsset: p1c2} = pair1
	const {baseAsset: p2c1, quoteAsset: p2c2} = pair2
	const { baseAsset: p3c1 } = pair3
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

type CalculatedSinglePairInfo = {
	action: TradeActionType
	pairName: string
}

type CalculatePredictionTradingProfit = {
	profitString: string,
	profit: BigNumber,
	pair1: CalculatedSinglePairInfo,
	pair2: CalculatedSinglePairInfo,
	pair3: CalculatedSinglePairInfo,
}

export function calculateTriangleProfit(triangle: TradingServiceTriangle): CalculatePredictionTradingProfit {

	const [pair1, pair2, pair3] = triangle

	const baseCurrency: PairAndPriceObject = {
		pairName: pair1.quoteAsset,
		amount: new BigNumber(BASE_CURRENCY_AMOUNT_FOR_CALCULATING),
	}
	//buy first for second
	const secondCurrency: PairAndPriceObject = {
		pairName: pair1.baseAsset,
		amount: baseCurrency.amount.dividedBy(new BigNumber(pair1.price)),
	}
	//sell first for third
	const thirdCurrency: PairAndPriceObject = {
		pairName: pair2.quoteAsset,
		amount: secondCurrency.amount.multipliedBy(new BigNumber(pair2.price))
	}
	let newBaseCurrAmount: BigNumber
	let pair3Action: TradeActionType
	// buy first for third
	if (pair2.quoteAsset === pair3.baseAsset) {
		newBaseCurrAmount = thirdCurrency.amount.multipliedBy(new BigNumber(pair3.price))
		pair3Action = "SELL"
	} else {
		newBaseCurrAmount = thirdCurrency.amount.dividedBy(new BigNumber(pair3.price))
		pair3Action = "BUY"
	}
	const profit = newBaseCurrAmount.dividedBy(baseCurrency.amount).minus(1).multipliedBy(100)
	return {
		profitString: profit.toString(),
		profit: profit,
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
