import axios from "axios"
import { CONFIG } from "../config"
import BigNumber from "bignumber.js"
import { FiatAssets } from "./apis"

//https://koronapay.com/transfers/online/api/transfers/directions/points/receiving?sendingCountryId=RUS&receivingMethod=cash

export type KoronaPayDirectionsResponse = {
  country: {
    id: KoronaPayCountryId
    code: string
    name: string
    phoneInfo: {
      prefix: string
      minLength: number
      maxLength: number
      format: string
    }
  }
  forbidden: boolean
}[]

//koronapay.com/transfers/online/api/transfers/tariffs/info?sendingCountryId=RUS&receivingCountryId=KGZ&paymentMethod=debitCard&forTransferRepeat=false
type KoronaPayCountryId =
  | "RUS"
  | "KGZ"
  | "AZE"
  | "MDA"
  | "KAZ"
  | "TJK"
  | "UZB"
  | "TUR"
  | "GEO"
  | "BLR"
  | "VNM"
  | "ISR"
  | "KOR"

export type KoronaPayPayMethod = "debitCard" | "cash"
export const koronaConf = {
  USD: 840,
  RUB: 810,
  TRY: 949,
}

export async function getRatesKoronaPay({
  sendingCountryId,
  sendingCurrencyId,
  receivingCountryId,
  receivingCurrencyId,
  paymentMethod,
  receivingAmount,
  receivingMethod,
  paidNotificationEnabled,
}: KoronaPayRequest): Promise<string> {
  const response = await axios.create().get(`${CONFIG.koronaPay.apiBaseUrl}/transfers/online/api/transfers/tariffs?
    sendingCountryId=${sendingCountryId}&
		sendingCurrencyId=${sendingCurrencyId}&
		receivingCountryId=${receivingCountryId}&
		receivingCurrencyId=${receivingCurrencyId}&
		paymentMethod=${paymentMethod}&
		receivingAmount=${receivingAmount}&
		receivingMethod=${receivingMethod}&
		paidNotificationEnabled=${paidNotificationEnabled}`)
  const data: KoronaPayResponse = response.data
  // @ts-ignore
  return new BigNumber(data).toString()
}

export async function getRateKoronaPayTurkUsd(): Promise<{ sendRub: BigNumber; receiveUsd: BigNumber }> {
  const response = await axios
    .create()
    .get(
      "https://koronapay.com/transfers/online/api/transfers/tariffs?sendingCountryId=RUS&sendingCurrencyId=810&receivingCountryId=TUR&receivingCurrencyId=840&paymentMethod=debitCard&receivingAmount=480000&receivingMethod=cash&paidNotificationEnabled=true"
    )
  const data: KoronaPayResponse = response.data
  const { receivingAmount, sendingAmount } = data[0]
  return {
    sendRub: new BigNumber(sendingAmount).dividedBy(100),
    receiveUsd: new BigNumber(receivingAmount).dividedBy(100),
  }
}

type KoronaPayRequest = {
  sendingCountryId: "RUS"
  sendingCurrencyId: number
  receivingCountryId: "TUR"
  receivingCurrencyId: number
  paymentMethod: string
  receivingAmount: number
  receivingMethod: "cash"
  paidNotificationEnabled: boolean
}

type KoronaPayResponse = {
  sendingCurrency: {
    id: string
    code: FiatAssets
    name: string
  }
  sendingAmount: number
  sendingAmountDiscount: number
  sendingAmountWithoutCommission: number
  sendingCommission: number
  sendingCommissionDiscount: number
  sendingTransferCommission: number
  paidNotificationCommission: number
  receivingCurrency: {
    id: string
    code: FiatAssets
    name: string
  }
  receivingAmount: number
  exchangeRate: number
  exchangeRateType: string
  exchangeRateDiscount: number
  profit: number
  properties: {}
}[]

//koronapay.com/transfers/online/api/transfers/tariffs?sendingCountryId=RUS&sendingCurrencyId=810&receivingCountryId=TUR&receivingCurrencyId=840&paymentMethod=debitCard&receivingAmount=100000&receivingMethod=cash&paidNotificationEnabled=true
