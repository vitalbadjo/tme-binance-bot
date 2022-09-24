import axios from "axios"
import { CONFIG } from "../config"

export async function getPredefinedDataSheet(): Promise<GetSheetsResponse> {
  const response = await axios
    .create()
    .get(
      `${CONFIG.sheets.apiBaseUrl}/spreadsheets/${process.env.GID}/values/${encodeURI("Sheet1!B5:K20")}?key=${
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
type GetSheetsResponse = Record<string, Record<string, string | number>>
type GetSheetsResponseRaw = {
  range: string
  majorDimension: string
  values: (string | number)[][]
}
// Sheet1%21A1%3AF10
