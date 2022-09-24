import { getRateKoronaPayTurkUsd } from "./korota-api"
import { getRatesBitexenUsdtLt } from "./apis"
import { getRateGarantex } from "./grtx"
import BigNumber from "bignumber.js"
import { CONFIG } from "../config"
import { getRatesDenizRubTry } from "./deniz"
import { getPredefinedDataSheet } from "./sheets"
import * as dotenv from "dotenv"

test("Korona test", async () => {
  const { sendRub, receiveUsd } = await getRateKoronaPayTurkUsd()
  console.log("sendRub", sendRub.toString())
  expect(sendRub.toNumber()).toBeGreaterThan(200000)
  console.log("receiveUsd", receiveUsd.toString())
  expect(receiveUsd.toNumber()).toEqual(4800)
})

test("Bitexen test", async () => {
  const result = await getRatesBitexenUsdtLt()
  console.log("result", result.toString())
  expect(result.toNumber()).toBeGreaterThan(10)
})

test("Garantex test", async () => {
  const result = await getRateGarantex()
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
