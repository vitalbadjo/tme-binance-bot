import TelegramBot, { Message } from "node-telegram-bot-api"
import { getPredefinedDataSheet } from "../../arb/sheets"
import { getRatesDenizRubTry } from "../../arb/deniz"
import { getRatesBitexenUsdtLt } from "../../arb/apis"
import { getRateGarantex } from "../../arb/grtx"
import BigNumber from "bignumber.js"
import { getRateKoronaPayFromRus } from "../../arb/korona/korona-api"
import { keyboards, TelegramCommands } from "./keyboards"

export async function telegramService(tmeApi: TelegramBot, message: Message) {
  switch (message.text as TelegramCommands) {
    case "Deniz margin now": {
      const { startCalculationAmount, resultCalculationAmount, marginPercentage, rubtry, tryusdt, usdtrub, resultRub } =
        await getDenizCalculation()
      const replyMessage = `<b>Маржа: ${marginPercentage.toFormat(2).toString()}%</b>
${resultRub.gt(0) ? "Прибыль" : "Убыток"}: ${resultRub.toFormat(2).toString()}\n
Стартовая сумма: ${startCalculationAmount.amount} ${startCalculationAmount.currency}
Конечная сумма: ${resultCalculationAmount.amount} ${resultCalculationAmount.currency}
Курс RUB/TRY: ${rubtry.toString()} (DenizBank)
Курс TRY/USDT: ${tryusdt.toString()} (Bitexen)
Курс USDT/RUB: ${usdtrub.toString()} (Garantex)`
      await getArbitrageResponse(tmeApi, message, replyMessage)
      break
    }
    case "KoronaPay": {
      const { startAmountRub, resultRub, garantexRate, fees, koronaRate, margin, endRub } =
        await getKoronaCalculations()
      const replyMessage = `<b>KoronaPay RUS --> TUR</b>
<b>Маржа: ${margin}%</b>
${resultRub.gt(0) ? "Прибыль" : "Убыток"}: ${resultRub.toFormat(2).toString()}\n
Стартовая сумма: ${startAmountRub} RUB
Конечная сумма: ${endRub.toString()} RUB
Комиссии: ${fees}%
Курс RUB/USD: ${koronaRate} (KoronaPay)
Курс USDT/RUB: ${garantexRate.toString()} (Garantex)`
      await getArbitrageResponse(tmeApi, message, replyMessage)
      break
    }
    case "SWIFT": {
      await getArbitrageResponse(tmeApi, message, "resp for swift")
      break
    }
    case "Subscribe": {
      await tmeApi.sendMessage(message.chat.id, "Chose subscription", {
        parse_mode: "HTML",
        reply_markup: keyboards.subscriptions,
      })
      break
    }
    case "Назад": {
      await tmeApi.sendMessage(message.chat.id, "Chose option", {
        parse_mode: "HTML",
        reply_markup: keyboards.initial,
      })
      break
    }
    case "Подписатся на Deniz":
    case "Подписатся на KoronaPay":
      await tmeApi.sendMessage(message.chat.id, "Not implemented yet...", {
        parse_mode: "HTML",
        reply_markup: keyboards.subscriptions,
      })
      break
    default: {
      await getArbitrageResponse(tmeApi, message, "Chose option")
    }
  }
}

async function getArbitrageResponse(tmeApi: TelegramBot, reqMessage: Message, resMessage: string = "Chose option") {
  await tmeApi.sendChatAction(reqMessage.chat.id, "typing")
  return tmeApi.sendMessage(reqMessage.chat.id, resMessage, {
    parse_mode: "HTML",
    reply_markup: keyboards.initial,
  })
}

async function getDenizCalculation(startAmountRub: string = "1000000") {
  const sheetDataRus = await getPredefinedDataSheet()
  const { tinkoff, deniz } = sheetDataRus
  const denizRate = await getRatesDenizRubTry()
  const bitexenRate = await getRatesBitexenUsdtLt()
  const garantexRate = await getRateGarantex()
  const result = new BigNumber(startAmountRub)
    .minus(new BigNumber(tinkoff ? tinkoff.korrRub : "0"))
    .minus(new BigNumber(deniz ? deniz.korrRub : "0"))
    .multipliedBy(denizRate)
    .minus(new BigNumber(deniz ? deniz.iban : "0"))
    .dividedBy(bitexenRate)
    .multipliedBy(new BigNumber("1").minus(new BigNumber(deniz ? deniz.dzh : "0").dividedBy(100)))
    .multipliedBy(garantexRate[0].price)
  return {
    startCalculationAmount: {
      amount: startAmountRub,
      currency: "RUB",
    },
    resultCalculationAmount: {
      amount: result.toFormat(2).toString(),
      currency: "RUB",
    },
    marginPercentage: result.dividedBy(startAmountRub).minus(1).multipliedBy(100),
    rubtry: denizRate,
    tryusdt: bitexenRate,
    usdtrub: garantexRate[0].price,
    resultRub: result.minus(new BigNumber(startAmountRub)),
  }
}

async function getKoronaCalculations() {
  const { exchangeRate, sendRub, receiveUsd } = await getRateKoronaPayFromRus("TUR", "USD", "5000")
  const { korona, turLocalExch } = await getPredefinedDataSheet()
  const garantexRate = await getRateGarantex()

  const koronaOfficeFee = new BigNumber(korona ? korona.korrPercent : "0")
  const localCryptoExchangeFee = new BigNumber(turLocalExch ? turLocalExch.korrPercent : "0")
  const fees = koronaOfficeFee.plus(localCryptoExchangeFee)

  const resultUsdt = receiveUsd.multipliedBy(new BigNumber("1").minus(fees))
  console.log("resultUsdt", resultUsdt.toString())
  const resultRub = resultUsdt.multipliedBy(garantexRate[0].price)
  console.log("resultRub", resultRub.toString())
  const resultMargin = resultRub.dividedBy(sendRub).minus("1").multipliedBy(100)

  return {
    startAmountRub: sendRub.toString(),
    koronaRate: exchangeRate.toString(),
    garantexRate: garantexRate[0].price.toString(),
    fees: koronaOfficeFee.plus(localCryptoExchangeFee).multipliedBy(100).toString(),
    margin: resultMargin.toFormat(2).toString(),
    endRub: resultRub.toFormat(2),
    resultRub: resultRub.minus(sendRub),
  }
}
