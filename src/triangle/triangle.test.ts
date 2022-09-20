import { alignToStepSize, TradingService } from "./trading-service"
import { Spot } from "@binance/connector"


it("test delimiter", () => {
	const data2 = "1234.03141"
	const limiter1 = "1.00"
	const limiter2 = "1"
	const limiter3 = "0.1"
	const limiter4 = "0.0000001"
	console.log(alignToStepSize(data2, limiter1))
	console.log(alignToStepSize(data2, limiter2))
	console.log(alignToStepSize(data2, limiter3))
	console.log(alignToStepSize(data2, limiter4))
})
//APIK=JqJc8toscQL8hTKYdS8jbLbfNLg3m3chNmvgOV7Y9aRcu2QhgUmMNyIisE1FMhPt;APIS=UR4QVa8C0uuAIpbpC56tLpBzToJoUw5fIpqZRtdxf9ouN1gMEISgYKvg9t4CtPNb
it ("bn", async () => {

	const tradingService = new TradingService(30, false,["USDT"])
	const data = tradingService.getRows([], 4)
	console.log("data", data[0])
}, 100000)

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
	const tradingService = new TradingService(30, false,["USDT"], ["BTCST"])
	const data = await tradingService.getDataWithPrices()
	const result = tradingService.getRows(data, 3)
	console.log("result", result.filter(el => el.predicatedProfit.bn.gt(1)).sort((a,b) => b.predicatedProfit.bn.toNumber() - a.predicatedProfit.bn.toNumber()))
	// const itemToTrade = result.sort((a,b) => b.predicatedProfit.bn.toNumber() - a.predicatedProfit.bn.toNumber())[0]
	// if (itemToTrade.predicatedProfit.bn.gt(2)) {
	// 	const trade = await tradingService.trade(itemToTrade)
	// 	console.log("trade", trade)
	// }

}, 100000)

test("handle trade test", async () => {
	const client = new Spot(process.env.APIK, process.env.APIS, { baseURL: "https://api1.binance.com"})
	const order = await client.newOrder(
		"BTCBUSD",
		"BUY",
		"MARKET",
		{ quoteOrderQty: "18" },
	)
	console.log("order", order.data)
})
//3846
//quoteOrderQty quantity

test("New test trade", async () => {
	const service = new TradingService(1000, false, ["USDT", "BUSD", "ETH", "BTC"], ["BTCST", "TCT"])
	const data = await service.getDataWithPrices()
	const row = service.getRows(data, 3)
		.filter(el => el.predicatedProfit.bn.gte(5))
		.sort((a,b) => b.predicatedProfit.bn.toNumber() - a.predicatedProfit.bn.toNumber())[0]

	if (row) {
		const result = await service.trade(row, false)
		console.log("result", result)
	} else {
		console.log("No weather to trade")
	}

}, 1000000)

