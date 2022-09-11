import axios from "axios"
import { CONFIG, CURRENCY_DELIMITER } from "../config"
import { BnbGetAssetsResponse } from "../triangle/types"
import { addDelimiter, extractAllCurrencies, removeDelimiter } from "../triangle/utils"
import { priceData } from "../triangle/fakeData/priceData"
import { SpotAccountInfo } from "./binance-types"
const SPOT_REQUEST_PAIRS_LIMIT = 100
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

export async function getSpotAssets(): Promise<BnbGetAssetsResponse> {
	const response = await axios.create().get(`${CONFIG.binance.apiBaseUrl}/api/v3/exchangeInfo`)
	return response.data
}
//https://api.binance.com/api/v3/ticker/price?symbols=[%22BTCUSDT%22,%22BNBUSDT%22]
//[{"symbol":"BTCUSDT","price":"19274.27000000"},{"symbol":"BNBUSDT","price":"278.90000000"}]
export type SpotRatesResponse = {
	symbol: string,
	price: string,
}

export async function getSpotRatesAll(): Promise<SpotRatesResponse[]> {
	const response = await  axios.create().get(`${CONFIG.binance.apiBaseUrl}/api/v3/ticker/price`)
	return response.data
}

//important symbol parameter without delimiter
export async function getSpotRates(symbols: string[], test: boolean = false): Promise<SpotRatesResponse[]> {
	if (test) {
		const symbolsDelimited = removeDelimiter(symbols)
		return priceData.filter(el => symbolsDelimited!.includes(el.symbol)).map((el) => {
			const symbol = symbols!.find(val => val.split(CURRENCY_DELIMITER).join("") === el.symbol)
			if (!symbol) {
				console.log("TEST BRANCH Console error", "symbol:", symbol)
				throw new Error("TEST BRANCH Response is OK, but add delimiter is throw error")
			}
			return {
				symbol,
				price: el.price
			}
		})
	}
	if (symbols.length === 1) {
		symbols = removeDelimiter(symbols)
		const currencies = extractAllCurrencies(symbols)
		const response = await  axios.create().get(`${CONFIG.binance.apiBaseUrl}/api/v3/ticker/price?symbol=${symbols[0]}`)
		const {symbol, price} = response.data as SpotRatesResponse
		return [{
			symbol: addDelimiter(symbol, currencies),
			price,
		}]
	} else if (symbols.length > 0) {
		symbols = removeDelimiter(symbols)
		if (symbols.length > SPOT_REQUEST_PAIRS_LIMIT) {
			throw new Error(`Too big request (more than ${SPOT_REQUEST_PAIRS_LIMIT} elements)`)
		}
		const response = await axios.create().get(`${CONFIG.binance.apiBaseUrl}/api/v3/ticker/price?symbols=${symbols}`)
		return response.data.map((el: SpotRatesResponse) => {
			return {
				symbol: symbols!.find(val => val.split(CURRENCY_DELIMITER).join("") === el.symbol),
				price: el.price
			}
		})
	} else {
		throw new Error("Get Spot rates request is empty")
	}

}



export async function getSpotAccountData(): Promise<SpotAccountInfo> {
	const response = await  axios.create().get(`${CONFIG.binance.apiBaseUrl}/api/v3/account`)
	return response.data
}
