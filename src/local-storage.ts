import { getRates, RatesResponseSimple } from "./apis/binance-api"

type MarketCache = Record<string, RatesResponseSimple & {isDelivered: boolean}>

export class LocalStorage {
	users: string[] = []
	cachedMarketData: MarketCache = {}

	constructor(public triggerPercentage: number) {
		this.triggerPercentage = triggerPercentage
	}

	public setUser(chatIds: string[]) {
		chatIds.forEach(chatId => {
			if (!(chatId in this.users)) {
				console.log(`Adding new chat with id: ${chatId}, to local storage`)
				this.users = [...this.users, chatId]
			} else {
				console.log(`Chat with id ${chatId} alredy exist`)
			}
		})
	}

	public getUsers() {
		return this.users
	}

	public setDelivered(symbol: string) {
		if (symbol in Object.keys(this.cachedMarketData)) {
			this.cachedMarketData[symbol].isDelivered = true
		}
	}

	// return new signals
	public async getMarketData(): Promise<MarketCache | undefined> {
		let changes: MarketCache = {}
		// Get data from binance api
		const rates = await getRates()
		// Filter actual signals
		const ratesFiltered = rates.filter(rate => parseInt(rate.priceChangePercent) >= this.triggerPercentage)
		// Check if exist in cache
		ratesFiltered.forEach(el => {
			// if already in cache
			if (el.symbol in Object.keys(this.cachedMarketData)) {
				console.log(`value already ccached: ${el.symbol} - ${el.priceChangePercent}`)
			} else {
				const newData = {
					isDelivered: false,
					askPrice: el.askPrice,
					symbol: el.symbol,
					priceChangePercent: el.priceChangePercent,
					priceChange: el.priceChange
				}
				changes[el.symbol] = newData
				this.cachedMarketData[el.symbol] = newData
			}
		})
		return Object.keys(changes).length ? changes : undefined
	}
}

