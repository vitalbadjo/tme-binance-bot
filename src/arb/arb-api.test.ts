import { getRatesBitexenUsdtLt } from "./apis"
import { getRateGarantex } from "./grtx"
import BigNumber from "bignumber.js"
import { CONFIG } from "../config"
import { getRatesDenizRubTry } from "./deniz"
import { getPredefinedDataSheet } from "./sheets"
import * as dotenv from "dotenv"
import {
  getKoronaAcceptedReceivingCurrencies,
  getKoronaDirectionPoints,
  getRateKoronaPayFromRus,
} from "./korona/korona-api"

test("Korona rate test", async () => {
  const { sendRub, receiveUsd, exchangeRate } = await getRateKoronaPayFromRus("TUR", "USD", "5000")
  console.log("exchangeRate: ", exchangeRate.toString())
  console.log("sendRub", sendRub.toString())
  expect(sendRub.toNumber()).toBeGreaterThan(200000)
  console.log("receiveUsd", receiveUsd.toString())
  expect(receiveUsd.toNumber()).toEqual(5000)
})

test("Korona directions test", async () => {
  const counties = await getKoronaDirectionPoints("RUS", "cash")
  console.log("counties: ", counties)
  expect(counties.length).toBeGreaterThan(0)
})

test("Korona accepted currencies test", async () => {
  const currencies = await getKoronaAcceptedReceivingCurrencies("RUS", "TUR")
  console.log("currencies: ", currencies)
  expect(currencies.length).toBeGreaterThan(0)
})

test("Bitexen test", async () => {
  const result = await getRatesBitexenUsdtLt()
  console.log("result", result.toString())
  expect(result.toNumber()).toBeGreaterThan(10)
})

test("Garantex test", async () => {
  const result = await getRateGarantex()
  console.log("result", result)
  expect(result.reduce<BigNumber>((p, c) => p.plus(c.usdValue), new BigNumber(0)).toNumber()).toBeGreaterThanOrEqual(
    new BigNumber(CONFIG.garantex.limitUstForBids).toNumber()
  )
}, 100000)

test("Deniz test", async () => {
  const result = await getRatesDenizRubTry()
  console.log("result", result.toString())
  expect(result.toNumber()).toBeGreaterThanOrEqual(0)
})

test("Sheets test", async () => {
  dotenv.config()
  const result = await getPredefinedDataSheet()
  console.log("result", result)
})
