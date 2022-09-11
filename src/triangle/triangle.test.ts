import { getTriangles } from "./index"
import { bnbInfoData } from "./fakeData/data"
import { addDelimiter, extractAllCurrencies, extractUniquePairs } from "./utils"
import { getSpotRates } from "../apis/binance-api"
import { calcSingle } from "./calculate-rates"
import { TradingService } from "./trading-service"

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
it ("bn", async () => {
	// const bn = await calculateRates(true)
	// console.log("bn", bn.filter(el => el.profitPercent.gt(1.5)).sort((a,b) => b.profitPercent.toNumber() - a.profitPercent.toNumber()))
	const tradingService = new TradingService(30)
	const data = await tradingService.getTrianglesData()
	console.log("data", data)
})
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
