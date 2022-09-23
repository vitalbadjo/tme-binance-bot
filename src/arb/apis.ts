import axios from "axios"
import { CONFIG } from "../config"
import BigNumber from "bignumber.js"

export type CryptoAssets = "USDT" | "BTC"
export type FiatAssets = "RUB" | "USD" | "EUR" | "TRY"
type ParibuRatesResponse = {
  success: boolean
  data: {
    bannerContent: any[]
    ticker: {
      "usdt-tl": {
        c: number
        b: number
        s: number
        priceSeries: number[]
      }
    }
    config: any
    fbtoken: any
    prbcoin: any
    pizzabutton: any
  }
}
// const a: ParibuRatesResponse = {
//   success: true,
//   data: {
//     ticker: {
//       "usdt-tl": {
//         c: 18.568,
//         b: 18.568,
//         s: 18.57,
//         priceSeries: [
//           18.485, 18.485, 18.496, 18.501, 18.515, 18.515, 18.511, 18.526,
//         ],
//       },
//     },
//     config: {},
//     fbtoken: {},
//     prbcoin: {},
//     pizzabutton: false,
//     bannerContent: [],
//   },
// }
export async function getRatesParibuUsdtLt(): Promise<string> {
  const response = await axios
    .create()
    .get(`${CONFIG.paribu.apiBaseUrl}/app/initials`)
  const data: ParibuRatesResponse = response.data
  return new BigNumber(data.data.ticker["usdt-tl"].c).toString()
}

export async function getRatesBitexenUsdtLt(): Promise<string> {
  const response = await axios
    .create()
    .get(`${CONFIG.bitexen.apiBaseUrl}/api/v1/market_info/USDTTRY/`)
  const data: BitexenResponse = response.data
  return new BigNumber(data.data.ticker.ask).toString()
}

type BitexenResponse = {
  status: "success" | "error"
  data: {
    ticker: {
      market: {
        market_code: string
        base_currency_code: string
        counter_currency_code: string
      }
      bid: string
      ask: string
      last_price: string
      last_size: string
      volume_24h: string
      change_24h: string
      low_24h: string
      high_24h: string
      avg_24h: string
      timestamp: string
    }
  }
}
