import { bnbInfoData } from "./fakeData/data"
import { BASE_CURRENCY_AMOUNT_FOR_CALCULATING } from "../config"
import BigNumber from "bignumber.js"
import { priceData } from "./fakeData/priceData"
import { getSpotRatesAll } from "../apis/binance-api"
import { Spot } from "@binance/connector"
import { SpotAccountInfo } from "../apis/binance-types"
import { delaySec } from "../utils"
import {
  CalculatePredictionTradingProfit,
  DataWithPrices,
  SeparatedByAssets,
  TradeActionType,
  TradingServiceResultTriangleSchema,
} from "./types"

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
    if (this.priceRequestIntervalSec * 1000 + this.priceRequestDate > new Date().getTime()) {
      console.log("Price request interval doesnt out")
      return this.dataWithPricesCache
    }
    this.priceRequestDate = new Date().getTime()
    const prices = this.test ? priceData : await getSpotRatesAll() // now takes 2-3 seconds that is too much...
    const dataWithPrices: DataWithPrices[] = bnbInfoData.symbols
      .filter(
        (e) =>
          e.isSpotTradingAllowed &&
          e.status === "TRADING" &&
          e.orderTypes.includes("MARKET") &&
          e.permissions.includes("SPOT") &&
          !this.filterAssets.includes(e.baseAsset) &&
          !this.filterAssets.includes(e.quoteAsset)
      )
      .map((e) => {
        const { baseAsset, quoteAsset, symbol, filters } = e
        const filterBase = filters.find((el) => el.filterType === "LOT_SIZE")
        const filterQuote = filters.find((el) => el.filterType === "PRICE_FILTER")
        return {
          baseAsset,
          quoteAsset,
          symbol,
          price: prices.find((el) => el.symbol === symbol)!.price,
          stepSizeQuote: filterQuote && "minPrice" in filterQuote ? filterQuote.minPrice : "0.00000001",
          stepSizeBase: filterBase && "minQty" in filterBase ? filterBase.minQty : "1",
        }
      })
    this.dataWithPricesCache = dataWithPrices
    return dataWithPrices
  }
  //{"filterType":"LOT_SIZE","minQty":"0.00010000","maxQty":"100000.00000000","stepSize":"0.00010000"}
  async trade(
    data: TradingServiceResultTriangleSchema,
    test: boolean = false
  ): Promise<{
    predicateProfit: string
    triangleString: string
    realProfit: string
  }> {
    const { triangleData: triangle, predicatedProfit, triangleString } = data
    if (!triangle.length) {
      console.log("Triangle is empty")
      return { predicateProfit: predicatedProfit.string, triangleString, realProfit: "not run" }
    }
    const baseAsset = this.depositedCurrencies.find((el) => triangle[0].symbol.search(el) >= 0)
    if (!baseAsset) {
      console.log("Cant define baseAsset of deal", triangle[0].symbol, this.depositedCurrencies)
      return { predicateProfit: predicatedProfit.string, triangleString, realProfit: "not run" }
    }

    const client = new Spot(process.env.APIK, process.env.APIS, { baseURL: "https://api.binance.com" })
    const baseAssetAmount = await retryBalance(baseAsset, new BigNumber(0), 300, 1)
    console.log("retry base asset (depo) ammount: ", baseAssetAmount)
    const result = await awaitTrade(
      client,
      triangle.map((el) => ({ ...el, isTraded: false })),
      baseAsset,
      baseAssetAmount.balance.toString(),
      1400,
      test
    )
    console.log("awaitTrade result: ", result)
    return {
      predicateProfit: predicatedProfit.string,
      triangleString,
      realProfit: new BigNumber(result.resultBaseBalance).minus(baseAssetAmount.balance).toString(),
    }
  }

  calculateTriangleProfit(triangle: DataWithPrices[], baseAsset: string): CalculatePredictionTradingProfit | undefined {
    if (!triangle.length) {
      console.log("Calculate Error: Triangle array is empty")
      return undefined
    }

    const baseAssetAmount = new BigNumber(BASE_CURRENCY_AMOUNT_FOR_CALCULATING)
    const profit = triangle.reduce<{ asset: string; amount: BigNumber }>(
      (p, c) => {
        const action = getTypeOfDeal(getOtherAsset(c.symbol, p.asset), c.symbol)
        if (action === "BUY") {
          //todo improve calculating by entire digits after testing on trade
          return {
            asset: c.baseAsset === p.asset ? c.quoteAsset : c.baseAsset,
            amount: p.amount.dividedBy(new BigNumber(c.price)).multipliedBy(new BigNumber(0.999)),
          }
        } else {
          return {
            asset: c.baseAsset === p.asset ? c.quoteAsset : c.baseAsset,
            amount: p.amount.multipliedBy(new BigNumber(c.price)).multipliedBy(new BigNumber(0.999)),
          }
        }
      },
      { asset: baseAsset, amount: baseAssetAmount }
    )
    const profitPercents = profit.amount.dividedBy(baseAssetAmount).minus(1).multipliedBy(100)
    return {
      profit: profitPercents,
      profitString: profitPercents.toString(),
      pairs: triangle,
    }
  }

  getRows(originList: DataWithPrices[], length: number = 3): TradingServiceResultTriangleSchema[] {
    const byAsset = getBasePairs(originList, this.depositedCurrencies)
    let result: TradingServiceResultTriangleSchema[] = []
    Object.entries(byAsset).forEach(([base, byAssetList]) => {
      const triangles = constructTriangles(originList, byAssetList, base, length)
      // console.log("triangles", triangles)
      return triangles.map((el) => {
        const calc = this.calculateTriangleProfit(el, base)
        result = [
          ...result,
          {
            triangleString: el.map((e) => e.symbol).join(","),
            triangleData: el,
            predicatedProfit: { string: calc!.profitString, bn: calc!.profit },
          },
        ]
      })
    })
    return result
  }
}

function getBasePairs(originList: DataWithPrices[], baseAssets: string[]): SeparatedByAssets {
  return originList.reduce<SeparatedByAssets>((p, c) => {
    baseAssets.forEach((el) => {
      if (el === c.baseAsset || el === c.quoteAsset) {
        p = {
          ...p,
          [el]: [...(p.hasOwnProperty(el) ? p[el] : []), c],
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
  return byAssetList
    .map((byAssetItem) => {
      const pairRow: DataWithPrices[] = [byAssetItem]
      let baseAsset = byAssetItem.quoteAsset === base ? byAssetItem.baseAsset : byAssetItem.quoteAsset
      // iterate n times to find new row in originList
      for (let i = 1; i < length; i++) {
        // console.log("pairRow.map(e => e.symbol)", pairRow.map(e => e.symbol))
        // console.log("base", base)
        // console.log("baseAsset", baseAsset)
        const element =
          i === length - 1
            ? findLastElementForRow(
                originList,
                pairRow.map((e) => e.symbol),
                base,
                baseAsset
              )
            : findPairInOriginListByBaseAsset(
                originList,
                baseAsset,
                pairRow.map((e) => e.symbol)
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
    })
    .filter((el) => el.length)
}

function findLastElementForRow(
  originList: DataWithPrices[],
  excludePairs: string[] = [],
  base1: string,
  base2: string
): { pair: DataWithPrices; newBase: string } | undefined {
  const pair = originList.find((el) => {
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
      newBase: "",
    }
  }
  return pair
}

function findPairInOriginListByBaseAsset(
  originList: DataWithPrices[],
  base: string,
  excludePairs: string[] = []
): { pair: DataWithPrices; newBase: string } | undefined {
  let newBase = ""
  const newPair = originList.find((el) => {
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
      newBase,
    }
  } else {
    return newPair
  }
}

// function isBase(pair: DataWithPrices, asset: string): boolean {
// 	return  pair.baseAsset === asset
// }

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
): Promise<{ balance: BigNumber; isEnough: boolean }> {
  const client = new Spot(process.env.APIK, process.env.APIS, { baseURL: "https://api.binance.com" })
  const {
    data: { balances },
  }: { data: SpotAccountInfo } = await client.account()
  const assetBalance = balances.find((el) => el.asset === asset)
  if (assetBalance) {
    const bal = new BigNumber(assetBalance.free)
    const isEnough = bal.gte(expectedBalance)
    if (bal.gte(expectedBalance)) {
      return {
        balance: bal,
        isEnough,
      }
    } else {
      if (tryNum === 0) {
        return {
          balance: bal,
          isEnough,
        }
      } else {
        return delaySec(delayMilliSec).then(() => retryBalance(asset, expectedBalance, delayMilliSec, tryNum - 1))
      }
    }
  } else {
    console.log("Retry balance error: try number is out but balance is undefined")
    return {
      balance: new BigNumber(0),
      isEnough: false,
    }
  }
}

async function awaitTrade(
  client: typeof Spot,
  row: (DataWithPrices & { isTraded: boolean })[],
  base: string,
  baseBalance: string,
  delayBetweenTrades: number,
  test: boolean
): Promise<{ resultBaseBalance: string }> {
  const pairToTrade = row.find((el) => !el.isTraded)
  const pairToTradeIndex = row.findIndex((el) => !el.isTraded)
  if (pairToTrade && pairToTradeIndex >= 0) {
    const { symbol } = pairToTrade
    const newBase = getOtherAsset(symbol, base)
    const action = getTypeOfDeal(newBase, symbol)
    const quantityParam =
      action === "BUY"
        ? { quoteOrderQty: alignToStepSize(baseBalance, pairToTrade.stepSizeQuote) }
        : { quantity: alignToStepSize(baseBalance, pairToTrade.stepSizeBase) }
    console.log(
      "Trade query:",
      `Symbol: ${symbol}\n Action: ${action}\n Type: MARKET\nQuantity: ${JSON.stringify(quantityParam)}`
    )
    let tradeResult: any = ""
    try {
      if (!test) {
        tradeResult = await client.newOrder(symbol, action, "MARKET", quantityParam)
      }
      row[pairToTradeIndex] = { ...pairToTrade, isTraded: true }
      if (tradeResult && tradeResult.data.status === "FILLED") {
        console.log("tradeResult.data", tradeResult.data)
        if (delayBetweenTrades) {
          await delaySec(delayBetweenTrades)
        }
        //todo may be await balance
        return awaitTrade(
          client,
          row,
          newBase,
          tradeResult.data.side === "SELL" ? tradeResult.data.cummulativeQuoteQty : tradeResult.data.executedQty,
          delayBetweenTrades,
          test
        )
      } else {
        throw new Error("Something wrong with trade result: tradeResult is undefined")
      }
    } catch (e: any) {
      console.log("Cant trade this pair", e)
      throw new Error(e)
    }
  } else {
    console.log("Congrats trade fully completed!!!")
    const { balance } = await retryBalance(base, new BigNumber(0), 200, 1)
    return {
      resultBaseBalance: balance.toString(),
    }
  }
}

export function alignToStepSize(price: string, stepSize: string): string {
  const [priceInt, priceDecimal] = price.split(".")
  if (stepSize.includes(".")) {
    const [int, decimal] = stepSize.split(".")
    if (int.search("1") >= 0) {
      return priceInt
    }
    return `${priceInt}.${priceDecimal.slice(0, decimal.search("1") + 1)}`
  } else {
    return priceInt
  }
}
