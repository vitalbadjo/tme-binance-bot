import { FiatAssets } from "../apis"

export type KoronaPayCountryId =
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
export type Currencies = "RUB" | "USD" | "UZS" | "EUR" | "KZT" | "BYN" | "AZN" | "KGS" | "GBP" | "CZK" | "PLN" | "SEK"
export type CurrenciesData = { id: string; code: string }
export type KoronaPaymentMethod = "cash" | "debitCard" | "creditCard"

export type KoronaGetDirectionPointsResponse = {
  country: {
    id: KoronaPayCountryId
    code: string
    name: string
    phoneInfo: any
  }
  forbidden: boolean
}[]

export type GetKoronaAcceptedReceivingCurrenciesResponse = {
  maxReceivingAmount: number
  minReceivingAmount: number
  paymentMethod: KoronaPaymentMethod
  receivingCurrency: CurrenciesData
  receivingMethod: KoronaPaymentMethod
  sendingCurrency: CurrenciesData
}[]

export type KoronaPayResponse = {
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

// type Countries = "RUS" | "UZB" | "BLR" | "KAZ" | "AZE" | "AUT" | "BEL" | "BGR" | "GBR" | "HUN" | "DEU"
//   | "GRC" | "DNK" | "IRL" | "ISL" | "ESP" | "ITA" | "CYP" | "LVA" | "LTU" | "LIE" | "LUX" | "MLT" | "NLD"
//   | "NOR" | "POL" | "PRT" | "ROU" | "SVK" | "SVN" | "FIN" | "FRA" | "HRV" | "CZE" | "EST" | "SWE"

// const currenciesAccepted = ["USD", "EUR", "RUR", "AZM", "MDL", "KZT", "TRY", "GEL", "BYR", "TJR"]
// const paymentAccepted = ["Cash", "Credit Card", "Debit card"]
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
export const currencies: Record<Currencies, CurrenciesData> = {
  RUB: {
    id: "810",
    code: "RUB",
  },
  USD: {
    id: "840",
    code: "USD",
  },
  UZS: {
    id: "860",
    code: "UZS",
  },
  EUR: {
    id: "978",
    code: "EUR",
  },
  KZT: {
    id: "398",
    code: "KZT",
  },
  BYN: {
    id: "933",
    code: "BYN",
  },
  AZN: {
    id: "944",
    code: "AZN",
  },
  KGS: {
    id: "417",
    code: "KGS",
  },
  GBP: {
    id: "826",
    code: "GBP",
  },
  CZK: {
    id: "203",
    code: "CZK",
  },
  PLN: {
    code: "PLN",
    id: "985",
  },
  SEK: {
    code: "SEK",
    id: "752",
  },
}
