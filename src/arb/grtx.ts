import BigNumber from "bignumber.js"
import axios from "axios"
import { CONFIG } from "../config"

export async function getRateGarantex(): Promise<{ price: BigNumber; usdValue: BigNumber }[]> {
  const response = await axios.create().get(`${CONFIG.garantex.apiBaseUrl}/depth?market=usdtrub`)
  const data: RateGarantexResponse = response.data
  const bids = data.bids.reduce<GarantexMarketItem[]>((p, c) => {
    const summ = p.reduce<BigNumber>((pr, cu) => pr.plus(new BigNumber(cu.volume)), new BigNumber(0))
    if (summ.lt(new BigNumber(CONFIG.garantex.limitUstForBids))) {
      return [...p, c]
    }
    return p
  }, [])
  return bids.map((e) => ({ price: new BigNumber(e.price), usdValue: new BigNumber(e.volume) }))
}

type GarantexMarketItem = {
  price: string
  volume: string
  amount: string
  factor: string
  type: string
}

type RateGarantexResponse = {
  timestamp: number
  asks: GarantexMarketItem[]
  bids: GarantexMarketItem[]
}
export const testData: RateGarantexResponse = {
  timestamp: 1663943280,
  asks: [
    { price: "63.65", volume: "55735.47", amount: "3547562.67", factor: "0.114", type: "limit" },
    { price: "63.8", volume: "62283.46", amount: "3973684.75", factor: "0.116", type: "limit" },
    { price: "63.85", volume: "23433.61", amount: "1496236.0", factor: "0.117", type: "limit" },
    { price: "63.9", volume: "86.05", amount: "5498.6", factor: "0.118", type: "limit" },
  ],
  bids: [
    { price: "63.45", volume: "188585.23", amount: "11965733.04", factor: "0.11", type: "limit" },
    { price: "63.4", volume: "350147.27", amount: "22199336.6", factor: "0.109", type: "limit" },
    { price: "63.35", volume: "205209.16", amount: "13000000.0", factor: "0.108", type: "limit" },
    { price: "63.3", volume: "327412.1", amount: "20725185.94", factor: "0.108", type: "limit" },
    { price: "63.25", volume: "7686.15", amount: "486149.25", factor: "0.107", type: "limit" },
  ],
}
