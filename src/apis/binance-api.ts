import axios from "axios"
import { CONFIG } from "../config"

export type GetRatesResponse = {
	askPrice: string
	askQty: string
	bidPrice: string
	bidQty: string
	closeTime: number
	count: number
	firstId: number
	highPrice: string
	lastId: number
	lastPrice: string
	lastQty: string
	lowPrice: string
	openPrice: string
	openTime: number
	prevClosePrice: string
	priceChange: string
	priceChangePercent: string
	quoteVolume: string
	symbol: string
	volume: string
	weightedAvgPrice: string
}

export type RatesResponseSimple = Pick<GetRatesResponse, "askPrice" | "symbol" | "priceChangePercent" | "priceChange">

export async function getRates(): Promise<GetRatesResponse[]> {
	const response = await axios.create().get(`${CONFIG.binance.fapiBaseUrl}/fapi/v1/ticker/24hr`)
	return response.data
}
