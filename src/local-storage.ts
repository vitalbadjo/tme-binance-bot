import { getRates, RatesResponseSimple } from "./apis/binance-api"

type MarketCache = Record<string, RatesResponseSimple & {isDelivered: boolean, expired: boolean}>

export class LocalStorage {
	users: string[] = []
	cachedMarketData: MarketCache = {}

	constructor(public triggerPercentage: number) {
		this.triggerPercentage = triggerPercentage
	}

	public setUser(chatIds: string[]) {
		console.log("this.users", this.users)
		chatIds.forEach(chatId => {
			if (!this.users.includes(chatId)) {
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

		// Check if exist in cache
		rates.forEach(el => {
			// Filter actual signals
			// const ratesFiltered = rates.filter(rate => parseInt(rate.priceChangePercent) >= this.triggerPercentage)
			// console.log("ratesFiltered", ratesFiltered)
			const newPercents = parseInt(el.priceChangePercent)
			// if already in cache
			if (Object.keys(this.cachedMarketData).includes(el.symbol)) {
				const cachedPercents = parseInt(this.cachedMarketData[el.symbol].priceChangePercent)
				if (newPercents >= this.triggerPercentage) {
					if (newPercents > cachedPercents) {
						this.cachedMarketData[el.symbol].isDelivered = false
					}
				} else {
					this.cachedMarketData[el.symbol].expired = true
				}
			} else {
				if (newPercents >= this.triggerPercentage) {
					const newData: RatesResponseSimple & {isDelivered: boolean, expired: boolean} = {
						isDelivered: false,
						askPrice: el.askPrice,
						symbol: el.symbol,
						priceChangePercent: el.priceChangePercent,
						priceChange: el.priceChange,
						expired: false
					}
					changes[el.symbol] = newData
					this.cachedMarketData[el.symbol] = newData
				}
			}
		})
		return Object.keys(changes).length ? changes : undefined
	}
}
