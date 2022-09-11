export type ResponseSymbol = {
	"symbol": string,
	"status": string,
	"baseAsset": string,
	"baseAssetPrecision": number,
	"quoteAsset": string,
	"quotePrecision": number,
	"quoteAssetPrecision": number,
	"baseCommissionPrecision": number,
	"quoteCommissionPrecision": number,
	"orderTypes": string[],
	"icebergAllowed": boolean,
	"ocoAllowed": boolean,
	"quoteOrderQtyMarketAllowed": boolean,
	"allowTrailingStop": boolean,
	"cancelReplaceAllowed": boolean,
	"isSpotTradingAllowed": boolean,
	"isMarginTradingAllowed": boolean,
	"filters":
		({
			"filterType": string,
			"minPrice": string,
			"maxPrice": string,
			"tickSize": string
		} |
			{
				"filterType": string,
				"multiplierUp": string,
				"multiplierDown": string,
				"avgPriceMins": 5
			} |
			{
				"filterType": string,
				"minQty": string,
				"maxQty": string,
				"stepSize": string
			} |
			{
				"filterType": string,
				"minNotional": string,
				"applyToMarket": true,
				"avgPriceMins":number
			} |
			{
				"filterType": string,
				"limit": number
			} |
			{
				"filterType": string,
				"minQty": string,
				"maxQty": string,
				"stepSize": string
			} |
			{
				"filterType": string,
				"minTrailingAboveDelta": number,
				"maxTrailingAboveDelta": number,
				"minTrailingBelowDelta": number,
				"maxTrailingBelowDelta": number
			}|
			{
				"filterType": string,
				"maxNumOrders": number
			} |
			{
				"filterType": string,
				"maxNumAlgoOrders": number
			} |             {
			"filterType": "MAX_POSITION",
			"maxPosition": string
		} |             {
			"filterType": "PERCENT_PRICE_BY_SIDE",
			"bidMultiplierUp": string,
			"bidMultiplierDown": string,
			"askMultiplierUp": string,
			"askMultiplierDown": string,
			"avgPriceMins": number
		})[],
	"permissions": string[]
}
export type BnbGetAssetsResponse = {
	timezone: string,
	serverTime: number,
	rateLimits: any[],
	exchangeFilters: any[],
	symbols: ResponseSymbol[]
}

export type Triangle = [string, string, string]
export type Triangles = Triangle[]

export type CalculatedRate = {
	triangle: Triangle,
	profit: string
}
