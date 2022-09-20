import { TradingService } from "./trading-service"
import { Spot } from "@binance/connector"

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
		"BUSDUSDT",
		"SELL",
		"MARKET",
		{ quantity: "62" },
	)
	console.log("order", order)
})
//quoteOrderQty quantity

test("New test trade", async () => {
	const service = new TradingService(1000, false, ["USDT", "USDC", "BUSD", "BNB", "ETH", "BTC"], ["BTCST"])
	const data = await service.getDataWithPrices()
	const row = service.getRows(data, 3)
		.filter(el => el.predicatedProfit.bn.gte(1))
		.sort((a,b) => b.predicatedProfit.bn.toNumber() - a.predicatedProfit.bn.toNumber())[0]

	const result = await service.trade(row)
	console.log("result", result)
})

