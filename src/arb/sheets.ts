import axios from "axios"
import { CONFIG } from "../config"

export async function getPredefinedDataSheet(page: "Sheet1" | "Sheet2" = "Sheet1"): Promise<GetSheetsResponse> {
  const response = await axios
    .create()
    .get(
      `${CONFIG.sheets.apiBaseUrl}/spreadsheets/${process.env.GID}/values/${encodeURI(`${page}!B5:K20`)}?key=${
        process.env.GKEY
      }`
    )
  const data: GetSheetsResponseRaw = response.data
  const jsonReady: GetSheetsResponse = data.values.reduce<GetSheetsResponse>((p, c, _, arr) => {
    if (c[0] !== "null") {
      return {
        ...p,
        [c[0]]: c.reduce((pr, cu, ind) => {
          if (ind) {
            return { ...pr, [arr[0][ind]]: cu }
          }
          return pr
        }, {}),
      }
    }
    return p
  }, {})
  return jsonReady
}
type BanksRus =
  | "rosbank"
  | "tinkoff"
  | "raiffaisen"
  | "bks"
  | "uralsib"
  | "rshb"
  | "reneissance"
  | "deniz"
  | "korona"
  | "turLocalExch"
type BanksRusComiisions = "korrPercent" | "korrRub" | "swiftPercent" | "swiftUsd" | "delayDays" | "iban" | "dzh"
type GetSheetsResponse = Partial<Record<BanksRus, Record<BanksRusComiisions, string | number>>>
type GetSheetsResponseRaw = {
  range: string
  majorDimension: string
  values: (BanksRus | BanksRusComiisions | "null")[][]
}
// Sheet1%21A1%3AF10
