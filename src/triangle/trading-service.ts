import { bnbInfoData } from "./fakeData/data"
import { BASE_CURRENCY_AMOUNT_FOR_CALCULATING } from "../config"
import BigNumber from "bignumber.js"
import { TradeActionType } from "./calculate-rates"
import { priceData } from "./fakeData/priceData"
import { getSpotRatesAll } from "../apis/binance-api"
import { Spot } from "@binance/connector"
import { SpotAccountAsset, SpotAccountInfo } from "../apis/binance-types"
import { delaySec } from "../utils"

export type DataWithPrices = {
	baseAsset: string
	quoteAsset: string
	symbol: string
	price: string
	stepSize: string
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

/**
 * must have
 * can add base balanced pairs to trade
 * +have filter to exclude assets from analysis (on add prices step)
 * -get data from binance methods - may be private
 * +make public object with all pairs and prices - ok
 * get trading row with length declared in length parameter
 * calculate trading row (maybe in get trading row function)
 * print result data from trading row delimited with ";" for import in .csv
 *
 * more: refresh input pairs data from bnb endpoint and write to local variable
 */
export class TradingService {
	priceRequestDate: number = 0
	dataWithPricesCache: DataWithPrices[] = []
	constructor(
		readonly priceRequestIntervalSec: number,
		readonly test: boolean = false,
		readonly depositedCurrencies: string[] = ["USDT", "USDC", "BUSD", "BNB", "ETH", "BTC"],
		readonly filterAssets: string[] = []
	) {
		this.priceRequestIntervalSec = priceRequestIntervalSec
		this.test = test
		this.depositedCurrencies = depositedCurrencies
		this.filterAssets = filterAssets
		this.trade = this.trade.bind(this)
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
				&& !this.filterAssets.includes(e.baseAsset)
				&& !this.filterAssets.includes(e.quoteAsset)
			)
			.map(e => {
				const { baseAsset, quoteAsset, symbol, filters } = e
				const filter = filters.find(el => el.filterType === "LOT_SIZE")
				return {
					baseAsset,
					quoteAsset,
					symbol,
					price: prices.find(el => el.symbol === symbol)!.price,
					stepSize: filter && "stepSize" in filter ? filter.stepSize : "0.0001"
				}
			})
		this.dataWithPricesCache = dataWithPrices
		return dataWithPrices
	}
//{"filterType":"LOT_SIZE","minQty":"0.00010000","maxQty":"100000.00000000","stepSize":"0.00010000"}
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
			const queryAsset1 = getOtherAsset(triangle[0].symbol, baseAsset)
			const action1 = getTypeOfDeal(queryAsset1, triangle[0].symbol)
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
						...isBase(triangle[0], baseAsset) ? {quantity: baseAssetAmount} : { quoteOrderQty: baseAssetAmount }
					}
				)
			} else {
				tradeResult1 = await client.newOrder(
					triangle[0].symbol,
					action1,
					"MARKET",
					{
						...isBase(triangle[0], baseAsset) ? { quoteOrderQty: baseAssetAmount } : {quantity: baseAssetAmount}
					}
				)
			}
			console.log("tradeResult1", tradeResult1)
			await new Promise(resolve => setTimeout(resolve, time))
			let balances: SpotAccountAsset[] = (await client.account()).data.balances
			const baseAssetAmount2 = balances.find(el => el.asset === queryAsset1)!.free
			const baseAsset2 = queryAsset1
			const queryAsset2 = getOtherAsset(triangle[1].symbol, baseAsset2)
			const action2 = getTypeOfDeal(queryAsset2, triangle[1].symbol)
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
						...isBase(triangle[1], baseAsset2) ? {quantity: baseAssetAmount2} : { quoteOrderQty: baseAssetAmount2 }
					}
				)
			} else {
				tradeResult2 = await client.newOrder(
					triangle[1].symbol,
					action2,
					"MARKET",
					{
						...isBase(triangle[1], baseAsset2) ? { quoteOrderQty: baseAssetAmount2 } : {quantity: baseAssetAmount2}
					}
				)
			}
			console.log("tradeResult2", tradeResult2)
			await new Promise(resolve => setTimeout(resolve, time))
			balances = (await client.account()).data.balances
			const baseAssetAmount3 = balances.find(el => el.asset === queryAsset2)!.free
			const baseAsset3 = queryAsset2
			const queryAsset3 = getOtherAsset(triangle[2].symbol, baseAsset3)
			const action3 = getTypeOfDeal(queryAsset3, triangle[2].symbol)
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
						...isBase(triangle[2], baseAsset3) ? {quantity: baseAssetAmount3} : { quoteOrderQty: baseAssetAmount3 }
					}
				)
			} else {
				tradeResult3 = await client.newOrder(
					triangle[2].symbol,
					action3,
					"MARKET",
					{
						...isBase(triangle[2], baseAsset3) ? { quoteOrderQty: baseAssetAmount3 } : {quantity: baseAssetAmount3}
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

	calculateTriangleProfit(
		triangle: DataWithPrices[],
		baseAsset: string
	): CalculatePredictionTradingProfit | undefined {
		if (!triangle.length) {
			console.log("Calculate Error: Triangle array is empty")
			return undefined
		}

		const baseAssetAmount = new BigNumber(BASE_CURRENCY_AMOUNT_FOR_CALCULATING)
		const profit = triangle.reduce<{ asset: string, amount: BigNumber }>(
			(p,c)=>{
				const action = getTypeOfDeal(getOtherAsset(c.symbol, p.asset), c.symbol)
				if (action === "BUY") {
					//todo improve calculating by entire digits after testing on trade
					return {
						asset: c.baseAsset === p.asset ? c.quoteAsset : c.baseAsset,
						amount: p.amount.dividedBy(new BigNumber(c.price)).multipliedBy(new BigNumber(0.999))
					}
				} else {
					return {
						asset: c.baseAsset === p.asset ? c.quoteAsset : c.baseAsset,
						amount: p.amount.multipliedBy(new BigNumber(c.price)).multipliedBy(new BigNumber(0.999))
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
	}

	getRows(
		originList: DataWithPrices[],
		baseAsset: string[],
		length: number = 3
	): TradingServiceResultTriangleSchema[] {

		const byAsset = getBasePairs(originList, baseAsset)
		let result: TradingServiceResultTriangleSchema[] = []
		Object.entries(byAsset).forEach(([base, byAssetList]) => {
			const triangles = constructTriangles(originList, byAssetList, base, length)
			// console.log("triangles", triangles)
			return triangles.map(el => {
				const calc = this.calculateTriangleProfit(el, base)
				result = [...result, {
					triangleString: el.map(e => e.symbol).join(","),
					triangleData: el,
					predicatedProfit: {string: calc!.profitString, bn: calc!.profit},
				}]
			})
		})
		return result.filter(el => el.predicatedProfit.bn.gt(0))
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

function constructTriangles(
	originList: DataWithPrices[],
	byAssetList: DataWithPrices[],
	base: string,
	length: number
): DataWithPrices[][] {
	return byAssetList.map(byAssetItem => {
		const pairRow: DataWithPrices[] = [byAssetItem]
		let baseAsset = byAssetItem.quoteAsset === base ? byAssetItem.baseAsset : byAssetItem.quoteAsset
		// iterate n times to find new row in originList
		for (let i = 1; i < length; i++) {
			// console.log("pairRow.map(e => e.symbol)", pairRow.map(e => e.symbol))
			// console.log("base", base)
			// console.log("baseAsset", baseAsset)
			const element = i === length - 1 ?
				findLastElementForRow(originList, pairRow.map(e => e.symbol), base, baseAsset) :
				findPairInOriginListByBaseAsset(originList, baseAsset, pairRow.map(e => e.symbol)
				)
			// console.log("element", element)
			if (element) {
				pairRow.push(element.pair)
				baseAsset = element.newBase
			} else {
				return []
			}
		}
		return pairRow
	}).filter(el => el.length)
	// return byAssetList.reduce<DataWithPrices[][]>((p, c) => {
	// 	let tempList = byAssetList.map(el => el)
	// 	let triangle: DataWithPrices[]
	// 	tempList.forEach(el => {
	// 		tempList = tempList.slice(1)
	// 		if (c.symbol !== el.symbol) {
	// 			const [first, second] = extractTwoPairsFromTwoBases(c, el, base)
	// 			const fd = originList.find(e => e.symbol === first)
	// 			const sd = originList.find(e => e.symbol === second)
	// 			if (fd) {
	// 				triangle = [c, fd, el]
	// 			} else if (sd) {
	// 				triangle = [c, sd, el]
	// 			}
	// 		} else {
	// 			triangle = []
	// 		}
	// 	})
	// 	return [...p, triangle]
	// }, [])
}

function findLastElementForRow(
	originList: DataWithPrices[],
	excludePairs: string[] = [],
	base1: string,
	base2: string
): { pair: DataWithPrices, newBase: string } | undefined {
	const pair = originList.find(el => {
		if (!excludePairs.length || (excludePairs.length && !excludePairs.includes(el.symbol))) {
			if (el.symbol === `${base1}${base2}`) {
				return true
			} else if (el.symbol === `${base2}${base1}`) {
				return true
			} else {
				return false
			}
		} else {
			return false
		}
	})
	if (pair) {
		return {
			pair,
			newBase: ""
		}
	}
	return pair
}
function findPairInOriginListByBaseAsset(
	originList: DataWithPrices[],
	base: string,
	excludePairs: string[] = [],
): { pair: DataWithPrices, newBase: string } | undefined {
	let newBase = ""
	const newPair = originList.find(el => {
		if (!excludePairs.length || (excludePairs.length && !excludePairs.includes(el.symbol))) {
			if (el.baseAsset === base) {
				newBase = el.quoteAsset
				return true
			} else if (el.quoteAsset === base) {
				newBase = el.baseAsset
				return true
			}
			return false
		} else {
			return false
		}
	})
	if (newPair) {
		return {
			pair: newPair,
			newBase
		}
	} else {
		return newPair
	}
}

export function extractTwoPairsFromTwoBases(firstPair: DataWithPrices, secondPair: DataWithPrices, base: string): [string, string] {
	const firstAsset = firstPair.baseAsset === base ? firstPair.quoteAsset : firstPair.baseAsset
	const secondAsset = secondPair.baseAsset === base ? secondPair.quoteAsset : secondPair.baseAsset
	return [`${firstAsset}${secondAsset}`, `${secondAsset}${firstAsset}`]
}

function isBase(pair: DataWithPrices, asset: string): boolean {
	return  pair.baseAsset === asset
}

function getTypeOfDeal(assetToBuy: string, pair: string): TradeActionType {
	if (pair.search(assetToBuy) === 0) {
		return "BUY"
	} else {
		return "SELL"
	}
}
function getOtherAsset(pair: string, asset: string): string {
	return pair.search(asset) === 0 ? pair.slice(asset.length) : pair.slice(0, pair.search(asset))
}

async function retryBalance(
	asset: string,
	expectedBalance: BigNumber,
	delayMilliSec: number,
	tryNum: number
): Promise<{ balance: BigNumber, isEnough: boolean }> {
	const client = new Spot(process.env.APIK, process.env.APIS, { baseURL: "https://api.binance.com"})
	const { data: { balances } }: {data: SpotAccountInfo} = await client.account()
	const assetBalance = balances.find(el => el.asset === asset)
	if (assetBalance) {
		const bal = new BigNumber(assetBalance.free)
		const isEnough = bal.gte(expectedBalance)
		if (bal.gte(expectedBalance)) {
			return {
				balance: bal,
				isEnough
			}
		} else {
			if (tryNum === 0) {
				return {
					balance: bal,
					isEnough
				}
			} else {
				return delaySec(delayMilliSec).then(() => retryBalance(asset, expectedBalance, delayMilliSec,tryNum - 1))
			}
		}
	} else {
		console.log("Retry balance error: try number is out but balance is undefined")
		return {
			balance: new BigNumber(0),
			isEnough: false
		}
	}
}

export async function awaitTrade(
	client: typeof Spot,
	row: (DataWithPrices & {isTraded: boolean})[],
	base: string,
	baseBalance: string
): Promise<{ resultBaseBalance: string }> {
	const pairToTrade = row.find(el => !el.isTraded)
	if (pairToTrade) {
		const {symbol} = pairToTrade
		const newBase = getOtherAsset(symbol, base)
		const action = getTypeOfDeal(newBase, symbol)
		const alignedBalance = alignToStepSize(baseBalance, pairToTrade.stepSize)
		const quantityParam = action === "BUY" ?
			{
				...isBase(pairToTrade, base) ? {quantity: alignedBalance} : { quoteOrderQty: alignedBalance }
			} :
			{
				...isBase(pairToTrade, base) ? { quoteOrderQty: alignedBalance } : {quantity: alignedBalance}
			}
		console.log("Trade query:", `Symbol: ${symbol}\n Action: ${action}\n Type: MARKET\nQuantity: ${JSON.stringify(quantityParam)}`)
		let tradeResult: any = ""
		try {
			tradeResult = await client.newOrder(
				symbol,
				action,
				"MARKET",
				quantityParam
			)
			if (tradeResult && tradeResult.data.status === "FILLED") {
				//todo may be await balance
				if (tradeResult.data.side === "SELL") {
					return awaitTrade(client, row, newBase, tradeResult.data.cummulativeQuoteQty)
				} else {
					return awaitTrade(client, row, newBase, tradeResult.data.executedQty)
				}
			} else {
				throw new Error("Something wrong with trade result: tradeResult is undefined")
			}
		} catch (e: any) {
			console.log("Cant trade this pair", e)
			throw new Error(e)
		}
	} else {
		console.log("Congrats trade fully completed!!!")
		const {balance} = await retryBalance(base, new BigNumber(0), 200, 3)
		return {
			resultBaseBalance: balance.toString()
		}
	}
}

function alignToStepSize(price: string, stepSize: string): string {
	return price.slice(0,stepSize.length)
}
