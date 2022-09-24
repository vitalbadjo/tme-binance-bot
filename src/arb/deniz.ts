import BigNumber from "bignumber.js"
import axios from "axios"
import { CONFIG } from "../config"

export async function getRatesDenizRubTry(): Promise<BigNumber> {
  const response = await axios.create().get(`${CONFIG.deniz.apiBaseUrl}/calculator/currency-rate`)
  const data: GetRatesDenizResponse[] = response.data
  return new BigNumber(data.find((e) => e["currency-code"] === "RUB")!.buy)
}

type GetRatesDenizResponse = {
  "currency-code": string
  sale: number
  buy: number
}
export const fakeDenizData = [
  { "currency-code": "USD", sale: 18.5445, buy: 18.2844 },
  { "currency-code": "EUR", sale: 18.3113, buy: 18.0508 },
  { "currency-code": "GBP", sale: 20.9945, buy: 20.6693 },
  { "currency-code": "CHF", sale: 18.9821, buy: 18.6858 },
  { "currency-code": "NOK", sale: 1.7951, buy: 1.7549 },
  { "currency-code": "DKK", sale: 2.4623, buy: 2.4177 },
  { "currency-code": "SEK", sale: 1.6827, buy: 1.6519 },
  { "currency-code": "SAR", sale: 4.9329, buy: 4.7651 },
  { "currency-code": "AUD", sale: 12.3526, buy: 12.1047 },
  { "currency-code": "CAD", sale: 13.7817, buy: 13.5874 },
  { "currency-code": "KWD", sale: 59.9179, buy: 59.0091 },
  { "currency-code": "JPY", sale: 0.12903, buy: 0.1268 },
  { "currency-code": "XAU", sale: 1007.4802, buy: 981.2843 },
  { "currency-code": "RUB", sale: 0.3102, buy: 0.2891 },
  { "currency-code": "ZAR", sale: 1.0515, buy: 1.0361 },
  { "currency-code": "BHD", sale: 49.1881, buy: 48.4919 },
  { "currency-code": "IDR", sale: 0.0012349, buy: 0.0012165 },
  { "currency-code": "MXN", sale: 0.9303, buy: 0.9169 },
  { "currency-code": "KZT", sale: 0.03863, buy: 0.038 },
  { "currency-code": "CNH", sale: 2.6177157, buy: 2.5806507 },
  { "currency-code": "QAR", sale: 5.0448754, buy: 4.9691446 },
  { "currency-code": "AED", sale: 5.0498, buy: 4.9785 },
  { "currency-code": "NPR", sale: 0.14372, buy: 0.1416786 },
  { "currency-code": "RON", sale: 3.7073, buy: 3.6515 },
  { "currency-code": "BRL", sale: 3.5864, buy: 3.5332 },
  { "currency-code": "CZK", sale: 0.7426947, buy: 0.7319068 },
  { "currency-code": "HUF", sale: 0.0449985, buy: 0.0443096 },
  { "currency-code": "NZD", sale: 10.8895502, buy: 10.7117894 },
  { "currency-code": "PLN", sale: 3.8355079, buy: 3.7792328 },
  { "currency-code": "THB", sale: 0.4975435, buy: 0.4898147 },
  { "currency-code": "XAG", sale: 11.7691, buy: 11.5122 },
  { "currency-code": "INR", sale: 0.229952, buy: 0.2266858 },
  { "currency-code": "XPT", sale: 547.0933, buy: 529.9613 },
  { "currency-code": "CNY", sale: 2.6293791, buy: 2.571313 },
  { "currency-code": "HKD", sale: 2.3627, buy: 2.32945 },
  { "currency-code": "SGD", sale: 13.072, buy: 12.8877 },
]
