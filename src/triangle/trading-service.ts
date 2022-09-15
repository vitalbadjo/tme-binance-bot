import { bnbInfoData } from "./fakeData/data"
import { BASE_CURRENCY_AMOUNT_FOR_CALCULATING } from "../config"
import BigNumber from "bignumber.js"
import { TradeActionType } from "./calculate-rates"
import { priceData } from "./fakeData/priceData"
import { getSpotRatesAll } from "../apis/binance-api"
import { Spot } from "@binance/connector"
import { SpotAccountAsset, SpotAccountInfo } from "../apis/binance-types"

export type DataWithPrices = {
	baseAsset: string
	quoteAsset: string
	symbol: string
	price: string
}
export type TradingServiceTriangle = [DataWithPrices, DataWithPrices, DataWithPrices]

export type TradingServiceResultTriangleSchema = {
	triangleString: string
	triangleData: DataWithPrices[]
	predicatedProfit: {
		string: string,
		bn: BigNumber
	}
	additionalPair?: DataWithPrices
}

export class TradingService {
	priceRequestDate: number = 0
	dataWithPricesCache: DataWithPrices[] = []
	constructor(
		readonly priceRequestIntervalSec: number,
		readonly test: boolean = false,
		readonly depositedCurrencies: string[] = ["USDT", "USDC", "BUSD", "BNB", "ETH", "BTC"],
	) {
		this.priceRequestIntervalSec = priceRequestIntervalSec
		this.depositedCurrencies = depositedCurrencies
		this.getTrianglesData = this.getTrianglesData.bind(this)
		this.trade = this.trade.bind(this)
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

	async getDataWithPrices(): Promise<DataWithPrices[]> {
		if ((this.priceRequestIntervalSec*1000 + this.priceRequestDate) > new Date().getTime()) {
			console.log("Price request interval doesnt out")
			return this.dataWithPricesCache
		}
		this.priceRequestDate = new Date().getTime()
		const prices = this.test ? priceData : await getSpotRatesAll()// now takes 2-3 seconds that is too much...
		const dataWithPrices: DataWithPrices[] = bnbInfoData.symbols
			.filter(e => e.isSpotTradingAllowed
				&& e.status === "TRADING"
				&& e.orderTypes.includes("MARKET")
				&& e.permissions.includes("SPOT")
				&& e.symbol.search("WBTC") === -1
				&& e.symbol.search("BTCST") === -1
				&& e.symbol.search("BETH") === -1
				&& e.symbol.search("BNB") === -1
			)
			.map(e => {
				const { baseAsset, quoteAsset, symbol } = e
				return {
					baseAsset,
					quoteAsset,
					symbol,
					price: prices.find(el => el.symbol === symbol)!.price
				}
			})
		this.dataWithPricesCache = dataWithPrices
		return dataWithPrices
	}
	async getTrianglesData(): Promise<TradingServiceResultTriangleSchema[]> {
		const dataWithPrices = await this.getDataWithPrices()

		return dataWithPrices.reduce<TradingServiceResultTriangleSchema[]>((p, c, _, arr) => {
			const { baseAsset, quoteAsset} = c

			const { currency: baseA, filtered: filteredByA } = this.filterByCurrency(baseAsset, arr)
			const { filtered: filteredByB } = this.filterByCurrency(quoteAsset, arr)
			//todo construct triangles and longest chain of pait with new algorithm
			filteredByA.forEach(ela => {
				const {baseAsset: aa, quoteAsset: ab} = ela
				if (aa === baseA) {
					filteredByB.forEach(elb => {
						const {baseAsset: ba, quoteAsset: bb} = elb
						if ((ba === ab || bb === ab) && this.compareTriangle(c.symbol, ela.symbol, elb.symbol)) {
							// @ts-ignore
							let { triangleData, depositAsset } = this.reshuffleTriangle([c, ela, elb])
							//todo may be return all possible deposit pait and triangles (for 5 pair)
							let triangleString = triangleData.map(e => e.symbol).join("")
							// const additionalPair = this.searchAdditionalPair(dataWithPrices, triangleData)
							// if (additionalPair) {
							// 	triangleData = [additionalPair, ...triangleData, additionalPair]
							// 	triangleString = `${additionalPair.symbol}${triangleString}${additionalPair.symbol}`
							// }

							if (!p.find(el => el.triangleString === triangleString)) {
								// const additionalPair = this.searchAdditionalPair(dataWithPrices, triangleData)
								const calc = this.calculateTriangleProfit(triangleData)
								if (calc && calc.profit.gt(0)) {
									p = [
										...p,
										{
											triangleString,
											triangleData,
											predicatedProfit: {string: calc.profitString, bn: calc.profit}
										}
									]
								}
							}
						}
					})
				} else {
					filteredByB.forEach(elb => {
						const {baseAsset: ba, quoteAsset: bb} = elb
						if ((ba === aa || bb === aa) && this.compareTriangle(c.symbol, ela.symbol, elb.symbol)) {
							// @ts-ignore
							let { triangleData, depositAsset } = this.reshuffleTriangle([c, ela, elb])
							//todo may be return all possible deposit pait and triangles (for 5 pair)
							let triangleString = triangleData.map(e => e.symbol).join("")
							// const additionalPair = this.searchAdditionalPair(dataWithPrices, triangleData)
							// if (additionalPair) {
							// 	triangleData = [additionalPair, ...triangleData, additionalPair]
							// 	triangleString = `${additionalPair.symbol}${triangleString}${additionalPair.symbol}`
							// }

							if (!p.find(el => el.triangleString === triangleString)) {
								const calc = this.calculateTriangleProfit(triangleData)
								if (calc && calc.profit.gt(0)) {
									p = [
										...p,
										{
											triangleString,
											triangleData,
											predicatedProfit: {string: calc.profitString, bn: calc.profit},
										}
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
	isBase(pair: DataWithPrices, asset: string): boolean {
		return  pair.baseAsset === asset
	}
	async trade(data: TradingServiceResultTriangleSchema): Promise<{
		predicateProfit: string,
		triangleString: string,
		realProfit: string
	}> {
		const time = 1000
		const { triangleData: triangle, predicatedProfit, triangleString } = data
		if (!triangle.length) {
			console.log("Triangle is empty")
			return {predicateProfit: predicatedProfit.string, triangleString, realProfit: "not run"}
		}
		const baseAsset =  this.depositedCurrencies.find(el => triangle[0].symbol.search(el) >= 0)
		if (!baseAsset) {
			console.log("Cant define baseAsset of deal", triangle[0].symbol, this.depositedCurrencies)
			return {predicateProfit: predicatedProfit.string, triangleString, realProfit: "not run"}
		}

		const client = new Spot(process.env.APIK, process.env.APIS, { baseURL: "https://api1.binance.com"})
		let { data: { balances } }: {data: SpotAccountInfo} = await client.account()
		const baseAssetAmount = balances.find(el => el.asset === baseAsset)!.free
		if (triangle.length === 3) {
			const queryAsset1 = this.getOtherAsset(triangle[0].symbol, baseAsset)
			const action1 = this.getTypeOfDeal(queryAsset1, triangle[0].symbol)
			console.log("baseAssetAmount", baseAssetAmount)
			console.log("baseAsset", baseAsset)
			console.log("queryAsset1", queryAsset1)
			console.log("action1", action1)
			let tradeResult1: any = ""
			if (action1 === "BUY") {
				tradeResult1 = await client.newOrder(
					triangle[0].symbol,
					action1,
					"MARKET",
					{
						...this.isBase(triangle[0], baseAsset) ? {quantity: baseAssetAmount} : { quoteOrderQty: baseAssetAmount }
					}
				)
			} else {
				tradeResult1 = await client.newOrder(
					triangle[0].symbol,
					action1,
					"MARKET",
					{
						...this.isBase(triangle[0], baseAsset) ? { quoteOrderQty: baseAssetAmount } : {quantity: baseAssetAmount}
					}
				)
			}
			console.log("tradeResult1", tradeResult1)
			await new Promise(resolve => setTimeout(resolve, time))
			let balances: SpotAccountAsset[] = (await client.account()).data.balances
			const baseAssetAmount2 = balances.find(el => el.asset === queryAsset1)!.free
			const baseAsset2 = queryAsset1
			const queryAsset2 = this.getOtherAsset(triangle[1].symbol, baseAsset2)
			const action2 = this.getTypeOfDeal(queryAsset2, triangle[1].symbol)
			console.log("baseAssetAmount2", baseAssetAmount2)
			console.log("baseAsset2", baseAsset2)
			console.log("queryAsset2", queryAsset2)
			console.log("action2", action2)

			let tradeResult2: any = ""
			if (action2 === "BUY") {
				tradeResult2 = await client.newOrder(
					triangle[1].symbol,
					action2,
					"MARKET",
					{
						...this.isBase(triangle[1], baseAsset2) ? {quantity: baseAssetAmount2} : { quoteOrderQty: baseAssetAmount2 }
					}
				)
			} else {
				tradeResult2 = await client.newOrder(
					triangle[1].symbol,
					action2,
					"MARKET",
					{
						...this.isBase(triangle[1], baseAsset2) ? { quoteOrderQty: baseAssetAmount2 } : {quantity: baseAssetAmount2}
					}
				)
			}
			console.log("tradeResult2", tradeResult2)
			await new Promise(resolve => setTimeout(resolve, time))
			balances = (await client.account()).data.balances
			const baseAssetAmount3 = balances.find(el => el.asset === queryAsset2)!.free
			const baseAsset3 = queryAsset2
			const queryAsset3 = this.getOtherAsset(triangle[2].symbol, baseAsset3)
			const action3 = this.getTypeOfDeal(queryAsset3, triangle[2].symbol)
			console.log("baseAssetAmount3", baseAssetAmount3)
			console.log("baseAsset3", baseAsset3)
			console.log("queryAsset3", queryAsset3)
			console.log("action3", action3)
			let tradeResult3: any = ""
			if (action3 === "BUY") {
				tradeResult3 = await client.newOrder(
					triangle[2].symbol,
					action3,
					"MARKET",
					{
						...this.isBase(triangle[2], baseAsset3) ? {quantity: baseAssetAmount3} : { quoteOrderQty: baseAssetAmount3 }
					}
				)
			} else {
				tradeResult3 = await client.newOrder(
					triangle[2].symbol,
					action3,
					"MARKET",
					{
						...this.isBase(triangle[2], baseAsset3) ? { quoteOrderQty: baseAssetAmount3 } : {quantity: baseAssetAmount3}
					}
				)
			}
			console.log("tradeResult3", tradeResult3)
			const result = new BigNumber(tradeResult3.executedQty).minus(new BigNumber(baseAssetAmount))
			return {
				predicateProfit: predicatedProfit.string,
				triangleString,
				realProfit: result.toString()
			}
		}
		return {
			predicateProfit: predicatedProfit.string,
			triangleString,
			realProfit: "end with no trading"
		}
		// console.log("spotAccountData", balances)
		// const tradeResult = await client.newOrder("BNBUSDT", "BUY", "MARKET", {quoteOrderQty: balances.find(el => el.asset === "USDT")!.free})
		// const tradeResult = await client.newOrder("BNBUSDT", "SELL", "MARKET", {quantity: 0.29})
		// const responseSell = {
		// 	symbol: 'BNBUSDT',
		// 		orderId: 4319883289,
		// 	orderListId: -1,
		// 	clientOrderId: 'ZsiCAman6fOKNETzIK7q4D',
		// 	transactTime: 1662926761439,
		// 	price: '0.00000000',
		// 	origQty: '0.29000000',
		// 	executedQty: '0.29000000',
		// 	cummulativeQuoteQty: '85.55000000',
		// 	status: 'FILLED',
		// 	timeInForce: 'GTC',
		// 	type: 'MARKET',
		// 	side: 'SELL',
		// 	fills: [
		// 	{
		// 		price: '295.00000000',
		// 		qty: '0.29000000',
		// 		commission: '0.00021749',
		// 		commissionAsset: 'BNB',
		// 		tradeId: 584622870
		// 	}
		// ]
		// }
		// const responseBuy = {
		// 	symbol: 'BNBUSDT',
		// 	orderId: 4319884063,
		// 	orderListId: -1,
		// 	clientOrderId: 'Ac8aEtbObm1e8xV2GxlSSV',
		// 	transactTime: 1662926848255,
		// 	price: '0.00000000',
		// 	origQty: '0.29000000',
		// 	executedQty: '0.29000000',
		// 	cummulativeQuoteQty: '85.57900000',
		// 	status: 'FILLED',
		// 	timeInForce: 'GTC',
		// 	type: 'MARKET',
		// 	side: 'BUY',
		// 	fills: [
		// 		{
		// 			price: '295.10000000',
		// 			qty: '0.29000000',
		// 			commission: '0.00021750',
		// 			commissionAsset: 'BNB',
		// 			tradeId: 584622968
		// 		}
		// 	]
		// }
		// console.log("tradeResult", tradeResult.data)
	}

	searchAdditionalPair(
		dataWithPrices: DataWithPrices[],
		triangle: DataWithPrices[]
	): DataWithPrices | undefined {
		//todo (move to trading func)separate rule for BNB asset? left some coins for comissions
		const { baseAsset, quoteAsset } = triangle[0]
		if (!this.depositedCurrencies.includes(baseAsset) && !this.depositedCurrencies.includes(quoteAsset)) {
			const pairsList = this.depositedCurrencies.reduce<string[]>((p,c) => {
				return [...p, `${baseAsset}${c}`, `${c}${baseAsset}`, `${quoteAsset}${c}`, `${c}${quoteAsset}`]
			}, [])

			for (const el of pairsList) {
				const searchElement = dataWithPrices.find(e => e.symbol === el)
				if (searchElement) {
					return searchElement
				}
			}
			// return dataWithPrices.find(el => el.symbol === `${baseAsset}${quoteAsset}` || el.symbol === `${quoteAsset}${baseAsset}`)
		}
		return undefined
	}

	getTypeOfDeal(assetToBuy: string, pair: string): TradeActionType {
		if (pair.search(assetToBuy) === 0) {
			return "BUY"
		} else {
			return "SELL"
		}
	}
	getOtherAsset(pair: string, asset: string): string {
		return pair.search(asset) === 0 ? pair.slice(asset.length) : pair.slice(0, pair.search(asset))
	}
	calculateTriangleProfit(
		triangle: DataWithPrices[],
	): CalculatePredictionTradingProfit | undefined {
		if (!triangle.length) {
			console.log("Triangle is empty")
			return undefined
		}
		const baseAsset =  this.depositedCurrencies.find(el => triangle[0].symbol.search(el) >= 0)
		if (!baseAsset) {
			console.log("Cant define baseAsset of deal", triangle[0].symbol, this.depositedCurrencies)
			return undefined
		}
		// const side = baseAsset ? triangle[0].symbol.search(baseAsset) === 0 ? "base" : "quote" : undefined
		// if (!side) throw new Error("Cant define side of deal")
		const baseAssetAmount = new BigNumber(BASE_CURRENCY_AMOUNT_FOR_CALCULATING)
		// console.log("CURRENT TRIANGLE", triangle.map(e => e.symbol))
		const profit = triangle.reduce<{ asset: string, amount: BigNumber }>(
			(p,c)=>{
				const action = this.getTypeOfDeal(this.getOtherAsset(c.symbol, p.asset), c.symbol)
				if (action === "BUY") {
					// console.log(`Action: BUY. Pair: ${c.symbol}. ${p.amount} / ${c.price}`)
					return {
						asset: c.baseAsset === p.asset ? c.quoteAsset : c.baseAsset,
						amount: p.amount.dividedBy(new BigNumber(c.price))
					}
				} else {
					// console.log(`Action: SELL. Pair: ${c.symbol}. ${p.amount} * ${c.price}`)
					return {
						asset: c.baseAsset === p.asset ? c.quoteAsset : c.baseAsset,
						amount: p.amount.multipliedBy(new BigNumber(c.price))
					}
				}
			},
			{asset: baseAsset, amount: baseAssetAmount}
		)
		const profitPercents = profit.amount.dividedBy(baseAssetAmount).minus(1).multipliedBy(100)
		return {
			profit: profitPercents,
			profitString: profitPercents.toString(),
			pairs: triangle,
		}

		//old
		// const [pair1, pair2, pair3] = triangle
		// const baseCurrency: PairAndPriceObject = {
		// 	pairName: pair1.quoteAsset,
		// 	amount: new BigNumber(BASE_CURRENCY_AMOUNT_FOR_CALCULATING),
		// }
		// //buy first for second
		// const secondCurrency: PairAndPriceObject = {
		// 	pairName: pair1.baseAsset,
		// 	amount: baseCurrency.amount.dividedBy(new BigNumber(pair1.price)),
		// }
		// //sell first for third
		// const thirdCurrency: PairAndPriceObject = {
		// 	pairName: pair2.quoteAsset,
		// 	amount: secondCurrency.amount.multipliedBy(new BigNumber(pair2.price))
		// }
		// let newBaseCurrAmount: BigNumber
		// let pair3Action: TradeActionType
		// // buy first for third
		// if (pair2.quoteAsset === pair3.baseAsset) {
		// 	newBaseCurrAmount = thirdCurrency.amount.multipliedBy(new BigNumber(pair3.price))
		// 	pair3Action = "SELL"
		// } else {
		// 	newBaseCurrAmount = thirdCurrency.amount.dividedBy(new BigNumber(pair3.price))
		// 	pair3Action = "BUY"
		// }
		// const profit = newBaseCurrAmount.dividedBy(baseCurrency.amount).minus(1).multipliedBy(100)
		// return {
		// 	profitString: profit.toString(),
		// 	profit: profit,
		// 	pair1: {
		// 		pairName: pair1.symbol,
		// 		action: "BUY"
		// 	},
		// 	pair2: {
		// 		pairName: pair2.symbol,
		// 		action: "SELL"
		// 	},
		// 	pair3: {
		// 		pairName: pair3.symbol,
		// 		action: pair3Action
		// 	}
		// }
	}

	reshuffleTriangle(
		triangle: TradingServiceTriangle
	): { triangleData: DataWithPrices[], depositAsset: string } {
		let depositAsset: string = ""
		const depPairs = triangle.filter(el => {
			const a = this.depositedCurrencies.find(e => el.baseAsset === e)
			const b = this.depositedCurrencies.find(e => el.quoteAsset === e)
			if (a) {
				depositAsset = a
				return true
			} else if (b) {
				depositAsset = b
				return true
			} else {
				return false
			}
		})
		if (depPairs.length === 2) {
			// console.log("depPairs.length", depPairs.length)
			return {
				depositAsset,
				triangleData: [
					depPairs[0],
					...triangle.filter(el => !this.depositedCurrencies.includes(el.baseAsset) && !this.depositedCurrencies.includes(el.quoteAsset)),
					depPairs[1],
				]
			}
		} else if (depPairs.length === 3) {
			try {
				const first = triangle.find(e => e.baseAsset === depositAsset || e.quoteAsset === depositAsset)
				const firstQuote = this.getOtherAsset(first!.symbol, depositAsset)
				const second = triangle.filter(e => e.symbol !== first!.symbol && (e.baseAsset === firstQuote || e.quoteAsset === firstQuote))[0]
				const third = triangle.find(e => e.symbol !== second!.symbol && e.symbol !== first!.symbol)
				return {
					triangleData: [first!, second!, third!],
					depositAsset
				}
			} catch (e) {
				console.log("Error:", triangle)
				return {depositAsset, triangleData: []}
			}
		} else {
			// console.log("this.dataWithPricesCache", this.dataWithPricesCache)
			const additionalPair = this.searchAdditionalPair(this.dataWithPricesCache, triangle)
			if (!additionalPair) {
				console.log("!additionalPair - should never happen")
				return {
					triangleData: [

					],
					depositAsset
				}
			} else {
				let quoteAsset: string = ""
				const addBaseAsset = this.depositedCurrencies.find(e => additionalPair.baseAsset === e)
				const addQueryAsset = this.depositedCurrencies.find(e => additionalPair.quoteAsset === e)

				if (addBaseAsset) {
					depositAsset = addBaseAsset
					quoteAsset = additionalPair.quoteAsset
				} else if (addQueryAsset) {
					depositAsset = addQueryAsset
					quoteAsset = additionalPair.baseAsset
				} else {
					throw new Error("Should never happen")
				}
				const first = triangle.find(e => e.baseAsset === quoteAsset || e.quoteAsset === quoteAsset)
				const firstQuote = this.getOtherAsset(first!.symbol, quoteAsset)
				const second = triangle.find(e => e.symbol !== first!.symbol && (e.baseAsset === firstQuote || e.quoteAsset === firstQuote))
				const third = triangle.find(e => e.symbol !== second!.symbol && e.symbol !== first!.symbol)
				const pentagon = [additionalPair, first!, second!, third!, additionalPair]
				return {
					depositAsset,
					triangleData: pentagon
				}
			}
		}
		// const [pair1, pair2, pair3] = triangle
		// const {baseAsset: p1c1, quoteAsset: p1c2} = pair1
		// const {baseAsset: p2c1, quoteAsset: p2c2} = pair2
		// const { baseAsset: p3c1 } = pair3
		// if (p1c1 === p2c1) {
		// 	if (p1c2 === p3c1) {
		// 		return [pair2, pair1, pair3]
		// 	} else {
		// 		return [pair1, pair2, pair3]
		// 	}
		// } else if (p1c1 === p3c1) {
		// 	if (p1c2 === p2c1) {
		// 		return [pair3, pair1, pair2]
		// 	} else {
		// 		return [pair1, pair3, pair2]
		// 	}
		// } else if (p2c1 === p3c1) {
		// 	if (p2c2 === p1c1) {
		// 		return [pair3, pair2, pair1]
		// 	} else {
		// 		return [pair2, pair3, pair1]
		// 	}
		// } else {
		// 	return [pair1, pair2, pair3]
		// }
	}

	getTr(originList: DataWithPrices[], baseAsset: string): TradingServiceResultTriangleSchema[] {
		const byAsset = getBasePairs(originList, [baseAsset])
		const triangles = constructTriangles(originList, byAsset[baseAsset], baseAsset)
		return triangles.map(el => {
			const calc = this.calculateTriangleProfit(el)
			return {
					triangleString: el.map(e => e.symbol).join(""),
					triangleData: el,
					predicatedProfit: {string: calc!.profitString, bn: calc!.profit},
				}
		}).filter(el => el.predicatedProfit.bn.gt(1))
	}
}


type CalculatedSinglePairInfo = {
	action: TradeActionType
	pairName: string
}

type CalculatePredictionTradingProfit = {
	profitString: string,
	profit: BigNumber,
	pairs: DataWithPrices[],
	pair1?: CalculatedSinglePairInfo,
	pair2?: CalculatedSinglePairInfo,
	pair3?: CalculatedSinglePairInfo,
}


/**
 * YFIUSDT YFIEUR YFIBTC BTCEUR YFIUSDT
 */


type SeparatedByAssets = Record<string, DataWithPrices[]>

function getBasePairs(originList: DataWithPrices[], baseAssets: string[]): SeparatedByAssets {
	return originList.reduce<SeparatedByAssets>((p, c) => {
		baseAssets.forEach(el => {
			if (el === c.baseAsset || el === c.quoteAsset) {
				p = {
					...p,
					[el]: [...(p.hasOwnProperty(el) ? p[el] : []), c]
				}
			}
		})
		return p
	}, {})
}

function constructTriangles(originList: DataWithPrices[], byAssetList: DataWithPrices[], base: string): TradingServiceTriangle[] {
	return byAssetList.reduce<TradingServiceTriangle[]>((p, c) => {
		let tempList = byAssetList.map(el => el)
		let triangle: TradingServiceTriangle | undefined
		tempList.forEach(el => {
			tempList = tempList.slice(1)
			if (c.symbol !== el.symbol) {
				const [first, second] = getTwoPairsFromTwoBases(c, el, base)
				const fd = originList.find(e => e.symbol === first)
				const sd = originList.find(e => e.symbol === second)
				if (fd) {
					triangle = [c, fd, el]
				} else if (sd) {
					triangle = [c, sd, el]
				}
			} else {
				triangle = undefined
			}
		})
		if (triangle) {
			return [...p, triangle]
		}
		return p
	}, [])
}

export function getTwoPairsFromTwoBases(firstPair: DataWithPrices, secondPair: DataWithPrices, base: string): [string, string] {
	const firstAsset = firstPair.baseAsset === base ? firstPair.quoteAsset : firstPair.baseAsset
	const secondAsset = secondPair.baseAsset === base ? secondPair.quoteAsset : secondPair.baseAsset
	return [`${firstAsset}${secondAsset}`, `${secondAsset}${firstAsset}`]
}
