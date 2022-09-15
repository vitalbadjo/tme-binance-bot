import { getTriangles } from "./index"
import { bnbInfoData } from "./fakeData/data"
import { addDelimiter, extractAllCurrencies, extractUniquePairs } from "./utils"
import { getSpotRates } from "../apis/binance-api"
import { calcSingle } from "./calculate-rates"
import { getTwoPairsFromTwoBases, TradingService } from "./trading-service"

it("testing triangle grabber", () => {
	const triangles = getTriangles(bnbInfoData, undefined, ["UAH"])// , "USDT", ["BTC", "ETH", "BNB", "TUSD"])
	console.log("triangles", triangles)
	const pairs = extractUniquePairs(triangles)
	console.log("pairs", pairs)
	const curr = extractAllCurrencies(pairs)
	console.log("curr", curr)
})

it ("test addDelimiter function", () => {
	const delimited = addDelimiter("BTCUSDT", ["ETH", "BTC", "USDT"])
	expect(delimited).toEqual("BTC/USDT")
})

it ("", async () => {
	const triangles = getTriangles(bnbInfoData, undefined, ["UAH"])// , "USDT", ["BTC", "ETH", "BNB", "TUSD"])
	console.log("triangles", triangles)
	const pairs = extractUniquePairs(triangles)
	console.log("pairs", pairs)
	const prices = await getSpotRates(pairs, true)
	console.log("prices", prices)
	// const calculated = calculateRates(true)
	// console.log("calculated filtered > 0", calculated.filter(el => el.profit.gt(new BN(0))))
	const fakePrices = [
		{ symbol: 'ETH/BTC', price: "0.08466900" },
		{ symbol: 'QTUM/ETH', price: "0.00189000" },
		{ symbol: 'QTUM/BTC', price: "0.00016000" }
	]
	const calc = calcSingle([ 'ETH/BTC', 'QTUM/ETH', 'QTUM/BTC' ], fakePrices)
	console.log("calc", calc.toString())
})

//APIK=JqJc8toscQL8hTKYdS8jbLbfNLg3m3chNmvgOV7Y9aRcu2QhgUmMNyIisE1FMhPt;APIS=UR4QVa8C0uuAIpbpC56tLpBzToJoUw5fIpqZRtdxf9ouN1gMEISgYKvg9t4CtPNb
it ("bn", async () => {
	// const bn = await calculateRates(true)
	// console.log("bn", bn.filter(el => el.profitPercent.gt(1.5)).sort((a,b) => b.profitPercent.toNumber() - a.profitPercent.toNumber()))
	//@ts-ignore

	const tradingService = new TradingService(30, false,["USDT"])
	const data = await tradingService.getTrianglesData()
	console.log("data", data[0])
	// if (data.filter(e => e.triangleData.length === 3)[0].predicatedProfit.bn.gt(3)) {
	// 	const tradeResult = await tradingService.trade(data.filter(e => e.triangleData.length === 3)[0])//await tradingService.getTrianglesData()
	// 	console.log("tradeResult", tradeResult)
	// } else {
	// 	console.log("no weather")
	// }


	// console.log("data", data)
}, 100000)
// it("testpair sort", () => {
// 	const triangle1: Triangle = [ 'ETH/BTC', 'BTC/USDT', 'ETH/USDT' ]
// 	const triangle2: Triangle = [ 'ETH/BTC', 'ETH/USDT', 'BTC/USDT' ]
// 	const triangle3: Triangle = [ 'BTC/USDT', 'ETH/BTC', 'ETH/USDT' ]
// 	const triangle4: Triangle = [ 'ETH/BTC', 'BTC/USDT', 'ETH/USDT' ]
// 	const triangle5: Triangle = [ 'ETH/BTC', 'BTC/USDT', 'ETH/USDT' ]
// 	const triangle6: Triangle = [ 'ETH/BTC', 'BTC/USDT', 'ETH/USDT' ]
// 	console.log("permutateTriangles", permutateTriangle([triangle1]))
// 	console.log("permutateTriangles", permutateTriangle([triangle2]))
// 	console.log("permutateTriangles", permutateTriangle([triangle3]))
// 	console.log("permutateTriangles", permutateTriangle([triangle4]))
// 	console.log("permutateTriangles", permutateTriangle([triangle5]))
// 	console.log("permutateTriangles", permutateTriangle([triangle6]))
// })

/**
 * 1. get all sybmols
 * 		extract triangles
 * 		extract all used pairs
 * 		extract all currencies like ["btc", "usdt", ....]	and write to global variables or DB
 *
 * 2. get rates for used pairs
 * 		make object with pair delimited and price
 * 		calculate triangles => object triangle profit percent
 */

test("new triangles function by asset", async () => {
	const tradingService = new TradingService(30, false,["USDT"])
	const data = await tradingService.getDataWithPrices()
	const result = tradingService.getTr(data, "USDT")
	console.log("result", result)
	// const itemToTrade = result.sort((a,b) => b.predicatedProfit.bn.toNumber() - a.predicatedProfit.bn.toNumber())[0]
	// if (itemToTrade.predicatedProfit.bn.gt(2)) {
	// 	const trade = await tradingService.trade(itemToTrade)
	// 	console.log("trade", trade)
	// }

}, 100000)
test("asdada", () => {
	const [a,b ] = getTwoPairsFromTwoBases(fake[0], fake[1], "USDT")
	console.log(a,b)
})

const fake = [{
		baseAsset: 'BTC',
		quoteAsset: 'USDT',
		symbol: 'BTCUSDT',
		price: '21423.20000000'
	},
	{
		baseAsset: 'ETH',
		quoteAsset: 'USDT',
		symbol: 'ETHUSDT',
		price: '21423.20000000'
	}]
