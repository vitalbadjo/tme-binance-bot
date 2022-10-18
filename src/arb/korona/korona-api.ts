import axios from "axios"
import { CONFIG } from "../../config"
import BigNumber from "bignumber.js"
import {
  currencies,
  Currencies,
  CurrenciesData,
  GetKoronaAcceptedReceivingCurrenciesResponse,
  KoronaGetDirectionPointsResponse,
  KoronaPayCountryId,
  KoronaPaymentMethod,
  KoronaPayResponse,
} from "./korona.types"

// /transfers/directions/points/receiving?sendingCountryId=RUS&receivingMethod=cash
export async function getKoronaDirectionPoints(
  sendingCountryId: KoronaPayCountryId = "RUS",
  receivingMethod: KoronaPaymentMethod = "cash"
): Promise<KoronaPayCountryId[]> {
  const response = await axios
    .create()
    .get<KoronaGetDirectionPointsResponse>(
      `${CONFIG.koronaPay.apiBaseUrl}/transfers/directions/points/receiving?sendingCountryId=${sendingCountryId}&receivingMethod=${receivingMethod}`
    )
  const { data } = response
  return data.map((c) => c.country.id)
}
// /transfers/tariffs?sendingCountryId=RUS&sendingCurrencyId=810&receivingCountryId=TUR&receivingCurrencyId=840&paymentMethod=debitCard&receivingAmount=480000&receivingMethod=cash&paidNotificationEnabled=true
export async function getRateKoronaPayFromRus(
  receivingCountryId: KoronaPayCountryId,
  receivingCurrencyId: Currencies,
  receivingAmountWN: string = "4800"
): Promise<{ sendRub: BigNumber; receiveUsd: BigNumber; exchangeRate: BigNumber }> {
  const response = await axios
    .create()
    .get<KoronaPayResponse>(
      `${CONFIG.koronaPay.apiBaseUrl}/transfers/tariffs?sendingCountryId=RUS&sendingCurrencyId=810&receivingCountryId=${receivingCountryId}&receivingCurrencyId=${currencies[receivingCurrencyId].id}&paymentMethod=debitCard&receivingAmount=${receivingAmountWN}00&receivingMethod=cash&paidNotificationEnabled=false`
    )
  const data = response.data
  const { receivingAmount, sendingAmount, exchangeRate } = data[0]
  return {
    sendRub: new BigNumber(sendingAmount).dividedBy(100),
    receiveUsd: new BigNumber(receivingAmount).dividedBy(100),
    exchangeRate: new BigNumber(exchangeRate),
  }
}

// https://koronapay.com/transfers/online/api/transfers/tariffs/info?receivingCountryId=TUR&sendingCountryId=RUS
export async function getKoronaAcceptedReceivingCurrencies(
  sendingCountryId: KoronaPayCountryId = "RUS",
  receivingCountryId: KoronaPayCountryId = "TUR"
): Promise<CurrenciesData[]> {
  const response = await axios
    .create()
    .get<GetKoronaAcceptedReceivingCurrenciesResponse>(
      `${CONFIG.koronaPay.apiBaseUrl}/transfers/tariffs/info?receivingCountryId=${receivingCountryId}&sendingCountryId=${sendingCountryId}`
    )
  const { data } = response
  return data.filter((e) => e.receivingMethod === "cash").map((e) => e.receivingCurrency)
}
