"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTwoPairsFromTwoBases = exports.TradingService = void 0;
var tslib_1 = require("tslib");
var data_1 = require("./fakeData/data");
var config_1 = require("../config");
var bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
var priceData_1 = require("./fakeData/priceData");
var binance_api_1 = require("../apis/binance-api");
var connector_1 = require("@binance/connector");
var TradingService = /** @class */ (function () {
    function TradingService(priceRequestIntervalSec, test, depositedCurrencies) {
        if (test === void 0) { test = false; }
        if (depositedCurrencies === void 0) { depositedCurrencies = ["USDT", "USDC", "BUSD", "BNB", "ETH", "BTC"]; }
        this.priceRequestIntervalSec = priceRequestIntervalSec;
        this.test = test;
        this.depositedCurrencies = depositedCurrencies;
        this.priceRequestDate = 0;
        this.dataWithPricesCache = [];
        this.priceRequestIntervalSec = priceRequestIntervalSec;
        this.depositedCurrencies = depositedCurrencies;
        this.getTrianglesData = this.getTrianglesData.bind(this);
        this.trade = this.trade.bind(this);
    }
    TradingService.prototype.filterByCurrency = function (currency, array) {
        return {
            currency: currency,
            filtered: array.filter(function (el) {
                var baseAsset = el.baseAsset, quoteAsset = el.quoteAsset;
                return (baseAsset.search(currency) === 0 && baseAsset.length === currency.length) ||
                    (quoteAsset.search(currency) === 0 && quoteAsset.length === currency.length);
            }),
        };
    };
    TradingService.prototype.compareTriangle = function (a, b, c) {
        return a !== b && b !== c && c !== a;
    };
    TradingService.prototype.getDataWithPrices = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var prices, _a, dataWithPrices;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if ((this.priceRequestIntervalSec * 1000 + this.priceRequestDate) > new Date().getTime()) {
                            console.log("Price request interval doesnt out");
                            return [2 /*return*/, this.dataWithPricesCache];
                        }
                        this.priceRequestDate = new Date().getTime();
                        if (!this.test) return [3 /*break*/, 1];
                        _a = priceData_1.priceData;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, (0, binance_api_1.getSpotRatesAll)()]; // now takes 2-3 seconds that is too much...
                    case 2:
                        _a = _b.sent(); // now takes 2-3 seconds that is too much...
                        _b.label = 3;
                    case 3:
                        prices = _a;
                        dataWithPrices = data_1.bnbInfoData.symbols
                            .filter(function (e) { return e.isSpotTradingAllowed
                            && e.status === "TRADING"
                            && e.orderTypes.includes("MARKET")
                            && e.permissions.includes("SPOT")
                            && e.symbol.search("WBTC") === -1
                            && e.symbol.search("BTCST") === -1
                            && e.symbol.search("BETH") === -1
                            && e.symbol.search("BNB") === -1; })
                            .map(function (e) {
                            var baseAsset = e.baseAsset, quoteAsset = e.quoteAsset, symbol = e.symbol;
                            return {
                                baseAsset: baseAsset,
                                quoteAsset: quoteAsset,
                                symbol: symbol,
                                price: prices.find(function (el) { return el.symbol === symbol; }).price
                            };
                        });
                        this.dataWithPricesCache = dataWithPrices;
                        return [2 /*return*/, dataWithPrices];
                }
            });
        });
    };
    TradingService.prototype.getTrianglesData = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var dataWithPrices;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDataWithPrices()];
                    case 1:
                        dataWithPrices = _a.sent();
                        return [2 /*return*/, dataWithPrices.reduce(function (p, c, _, arr) {
                                var baseAsset = c.baseAsset, quoteAsset = c.quoteAsset;
                                var _a = _this.filterByCurrency(baseAsset, arr), baseA = _a.currency, filteredByA = _a.filtered;
                                var filteredByB = _this.filterByCurrency(quoteAsset, arr).filtered;
                                //todo construct triangles and longest chain of pait with new algorithm
                                filteredByA.forEach(function (ela) {
                                    var aa = ela.baseAsset, ab = ela.quoteAsset;
                                    if (aa === baseA) {
                                        filteredByB.forEach(function (elb) {
                                            var ba = elb.baseAsset, bb = elb.quoteAsset;
                                            if ((ba === ab || bb === ab) && _this.compareTriangle(c.symbol, ela.symbol, elb.symbol)) {
                                                // @ts-ignore
                                                var _a = _this.reshuffleTriangle([c, ela, elb]), triangleData = _a.triangleData, depositAsset = _a.depositAsset;
                                                //todo may be return all possible deposit pait and triangles (for 5 pair)
                                                var triangleString_1 = triangleData.map(function (e) { return e.symbol; }).join("");
                                                // const additionalPair = this.searchAdditionalPair(dataWithPrices, triangleData)
                                                // if (additionalPair) {
                                                // 	triangleData = [additionalPair, ...triangleData, additionalPair]
                                                // 	triangleString = `${additionalPair.symbol}${triangleString}${additionalPair.symbol}`
                                                // }
                                                if (!p.find(function (el) { return el.triangleString === triangleString_1; })) {
                                                    // const additionalPair = this.searchAdditionalPair(dataWithPrices, triangleData)
                                                    var calc = _this.calculateTriangleProfit(triangleData);
                                                    if (calc && calc.profit.gt(0)) {
                                                        p = tslib_1.__spreadArray(tslib_1.__spreadArray([], p, true), [
                                                            {
                                                                triangleString: triangleString_1,
                                                                triangleData: triangleData,
                                                                predicatedProfit: { string: calc.profitString, bn: calc.profit }
                                                            }
                                                        ], false);
                                                    }
                                                }
                                            }
                                        });
                                    }
                                    else {
                                        filteredByB.forEach(function (elb) {
                                            var ba = elb.baseAsset, bb = elb.quoteAsset;
                                            if ((ba === aa || bb === aa) && _this.compareTriangle(c.symbol, ela.symbol, elb.symbol)) {
                                                // @ts-ignore
                                                var _a = _this.reshuffleTriangle([c, ela, elb]), triangleData = _a.triangleData, depositAsset = _a.depositAsset;
                                                //todo may be return all possible deposit pait and triangles (for 5 pair)
                                                var triangleString_2 = triangleData.map(function (e) { return e.symbol; }).join("");
                                                // const additionalPair = this.searchAdditionalPair(dataWithPrices, triangleData)
                                                // if (additionalPair) {
                                                // 	triangleData = [additionalPair, ...triangleData, additionalPair]
                                                // 	triangleString = `${additionalPair.symbol}${triangleString}${additionalPair.symbol}`
                                                // }
                                                if (!p.find(function (el) { return el.triangleString === triangleString_2; })) {
                                                    var calc = _this.calculateTriangleProfit(triangleData);
                                                    if (calc && calc.profit.gt(0)) {
                                                        p = tslib_1.__spreadArray(tslib_1.__spreadArray([], p, true), [
                                                            {
                                                                triangleString: triangleString_2,
                                                                triangleData: triangleData,
                                                                predicatedProfit: { string: calc.profitString, bn: calc.profit },
                                                            }
                                                        ], false);
                                                    }
                                                }
                                            }
                                        });
                                    }
                                });
                                return p;
                            }, []).sort(function (a, b) { return b.predicatedProfit.bn.toNumber() - a.predicatedProfit.bn.toNumber(); })];
                }
            });
        });
    };
    TradingService.prototype.isBase = function (pair, asset) {
        return pair.baseAsset === asset;
    };
    TradingService.prototype.trade = function (data) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var time, triangle, predicatedProfit, triangleString, baseAsset, client, balances, baseAssetAmount, queryAsset1_1, action1, tradeResult1, balances_1, baseAssetAmount2, baseAsset2, queryAsset2_1, action2, tradeResult2, baseAssetAmount3, baseAsset3, queryAsset3, action3, tradeResult3, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        time = 1000;
                        triangle = data.triangleData, predicatedProfit = data.predicatedProfit, triangleString = data.triangleString;
                        if (!triangle.length) {
                            console.log("Triangle is empty");
                            return [2 /*return*/, { predicateProfit: predicatedProfit.string, triangleString: triangleString, realProfit: "not run" }];
                        }
                        baseAsset = this.depositedCurrencies.find(function (el) { return triangle[0].symbol.search(el) >= 0; });
                        if (!baseAsset) {
                            console.log("Cant define baseAsset of deal", triangle[0].symbol, this.depositedCurrencies);
                            return [2 /*return*/, { predicateProfit: predicatedProfit.string, triangleString: triangleString, realProfit: "not run" }];
                        }
                        client = new connector_1.Spot(process.env.APIK, process.env.APIS, { baseURL: "https://api1.binance.com" });
                        return [4 /*yield*/, client.account()];
                    case 1:
                        balances = (_a.sent()).data.balances;
                        baseAssetAmount = balances.find(function (el) { return el.asset === baseAsset; }).free;
                        if (!(triangle.length === 3)) return [3 /*break*/, 18];
                        queryAsset1_1 = this.getOtherAsset(triangle[0].symbol, baseAsset);
                        action1 = this.getTypeOfDeal(queryAsset1_1, triangle[0].symbol);
                        console.log("baseAssetAmount", baseAssetAmount);
                        console.log("baseAsset", baseAsset);
                        console.log("queryAsset1", queryAsset1_1);
                        console.log("action1", action1);
                        tradeResult1 = "";
                        if (!(action1 === "BUY")) return [3 /*break*/, 3];
                        return [4 /*yield*/, client.newOrder(triangle[0].symbol, action1, "MARKET", tslib_1.__assign({}, this.isBase(triangle[0], baseAsset) ? { quantity: baseAssetAmount } : { quoteOrderQty: baseAssetAmount }))];
                    case 2:
                        tradeResult1 = _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, client.newOrder(triangle[0].symbol, action1, "MARKET", tslib_1.__assign({}, this.isBase(triangle[0], baseAsset) ? { quoteOrderQty: baseAssetAmount } : { quantity: baseAssetAmount }))];
                    case 4:
                        tradeResult1 = _a.sent();
                        _a.label = 5;
                    case 5:
                        console.log("tradeResult1", tradeResult1);
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, time); })];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, client.account()];
                    case 7:
                        balances_1 = (_a.sent()).data.balances;
                        baseAssetAmount2 = balances_1.find(function (el) { return el.asset === queryAsset1_1; }).free;
                        baseAsset2 = queryAsset1_1;
                        queryAsset2_1 = this.getOtherAsset(triangle[1].symbol, baseAsset2);
                        action2 = this.getTypeOfDeal(queryAsset2_1, triangle[1].symbol);
                        console.log("baseAssetAmount2", baseAssetAmount2);
                        console.log("baseAsset2", baseAsset2);
                        console.log("queryAsset2", queryAsset2_1);
                        console.log("action2", action2);
                        tradeResult2 = "";
                        if (!(action2 === "BUY")) return [3 /*break*/, 9];
                        return [4 /*yield*/, client.newOrder(triangle[1].symbol, action2, "MARKET", tslib_1.__assign({}, this.isBase(triangle[1], baseAsset2) ? { quantity: baseAssetAmount2 } : { quoteOrderQty: baseAssetAmount2 }))];
                    case 8:
                        tradeResult2 = _a.sent();
                        return [3 /*break*/, 11];
                    case 9: return [4 /*yield*/, client.newOrder(triangle[1].symbol, action2, "MARKET", tslib_1.__assign({}, this.isBase(triangle[1], baseAsset2) ? { quoteOrderQty: baseAssetAmount2 } : { quantity: baseAssetAmount2 }))];
                    case 10:
                        tradeResult2 = _a.sent();
                        _a.label = 11;
                    case 11:
                        console.log("tradeResult2", tradeResult2);
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, time); })];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, client.account()];
                    case 13:
                        balances_1 = (_a.sent()).data.balances;
                        baseAssetAmount3 = balances_1.find(function (el) { return el.asset === queryAsset2_1; }).free;
                        baseAsset3 = queryAsset2_1;
                        queryAsset3 = this.getOtherAsset(triangle[2].symbol, baseAsset3);
                        action3 = this.getTypeOfDeal(queryAsset3, triangle[2].symbol);
                        console.log("baseAssetAmount3", baseAssetAmount3);
                        console.log("baseAsset3", baseAsset3);
                        console.log("queryAsset3", queryAsset3);
                        console.log("action3", action3);
                        tradeResult3 = "";
                        if (!(action3 === "BUY")) return [3 /*break*/, 15];
                        return [4 /*yield*/, client.newOrder(triangle[2].symbol, action3, "MARKET", tslib_1.__assign({}, this.isBase(triangle[2], baseAsset3) ? { quantity: baseAssetAmount3 } : { quoteOrderQty: baseAssetAmount3 }))];
                    case 14:
                        tradeResult3 = _a.sent();
                        return [3 /*break*/, 17];
                    case 15: return [4 /*yield*/, client.newOrder(triangle[2].symbol, action3, "MARKET", tslib_1.__assign({}, this.isBase(triangle[2], baseAsset3) ? { quoteOrderQty: baseAssetAmount3 } : { quantity: baseAssetAmount3 }))];
                    case 16:
                        tradeResult3 = _a.sent();
                        _a.label = 17;
                    case 17:
                        console.log("tradeResult3", tradeResult3);
                        result = new bignumber_js_1.default(tradeResult3.executedQty).minus(new bignumber_js_1.default(baseAssetAmount));
                        return [2 /*return*/, {
                                predicateProfit: predicatedProfit.string,
                                triangleString: triangleString,
                                realProfit: result.toString()
                            }];
                    case 18: return [2 /*return*/, {
                            predicateProfit: predicatedProfit.string,
                            triangleString: triangleString,
                            realProfit: "end with no trading"
                        }
                        // console.log("spotAccountData", balances)
                        // const tradeResult = await client.newOrder("BNBUSDT", "BUY", "MARKET", {quoteOrderQty: balances.find(el => el.asset === "USDT")!.free})
                        // const tradeResult = await client.newOrder("BNBUSDT", "SELL", "MARKET", {quantity: 0.29})
                        // const responseSell = {
                        // 	symbol: 'BNBUSDT',
                        // 		orderId: 4319883289,
                        // 	orderListId: -1,
                        // 	clientOrderId: 'ZsiCAman6fOKNETzIK7q4D',
                        // 	transactTime: 1662926761439,
                        // 	price: '0.00000000',
                        // 	origQty: '0.29000000',
                        // 	executedQty: '0.29000000',
                        // 	cummulativeQuoteQty: '85.55000000',
                        // 	status: 'FILLED',
                        // 	timeInForce: 'GTC',
                        // 	type: 'MARKET',
                        // 	side: 'SELL',
                        // 	fills: [
                        // 	{
                        // 		price: '295.00000000',
                        // 		qty: '0.29000000',
                        // 		commission: '0.00021749',
                        // 		commissionAsset: 'BNB',
                        // 		tradeId: 584622870
                        // 	}
                        // ]
                        // }
                        // const responseBuy = {
                        // 	symbol: 'BNBUSDT',
                        // 	orderId: 4319884063,
                        // 	orderListId: -1,
                        // 	clientOrderId: 'Ac8aEtbObm1e8xV2GxlSSV',
                        // 	transactTime: 1662926848255,
                        // 	price: '0.00000000',
                        // 	origQty: '0.29000000',
                        // 	executedQty: '0.29000000',
                        // 	cummulativeQuoteQty: '85.57900000',
                        // 	status: 'FILLED',
                        // 	timeInForce: 'GTC',
                        // 	type: 'MARKET',
                        // 	side: 'BUY',
                        // 	fills: [
                        // 		{
                        // 			price: '295.10000000',
                        // 			qty: '0.29000000',
                        // 			commission: '0.00021750',
                        // 			commissionAsset: 'BNB',
                        // 			tradeId: 584622968
                        // 		}
                        // 	]
                        // }
                        // console.log("tradeResult", tradeResult.data)
                    ];
                }
            });
        });
    };
    TradingService.prototype.searchAdditionalPair = function (dataWithPrices, triangle) {
        //todo (move to trading func)separate rule for BNB asset? left some coins for comissions
        var _a = triangle[0], baseAsset = _a.baseAsset, quoteAsset = _a.quoteAsset;
        if (!this.depositedCurrencies.includes(baseAsset) && !this.depositedCurrencies.includes(quoteAsset)) {
            var pairsList = this.depositedCurrencies.reduce(function (p, c) {
                return tslib_1.__spreadArray(tslib_1.__spreadArray([], p, true), ["".concat(baseAsset).concat(c), "".concat(c).concat(baseAsset), "".concat(quoteAsset).concat(c), "".concat(c).concat(quoteAsset)], false);
            }, []);
            var _loop_1 = function (el) {
                var searchElement = dataWithPrices.find(function (e) { return e.symbol === el; });
                if (searchElement) {
                    return { value: searchElement };
                }
            };
            for (var _i = 0, pairsList_1 = pairsList; _i < pairsList_1.length; _i++) {
                var el = pairsList_1[_i];
                var state_1 = _loop_1(el);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
            // return dataWithPrices.find(el => el.symbol === `${baseAsset}${quoteAsset}` || el.symbol === `${quoteAsset}${baseAsset}`)
        }
        return undefined;
    };
    TradingService.prototype.getTypeOfDeal = function (assetToBuy, pair) {
        if (pair.search(assetToBuy) === 0) {
            return "BUY";
        }
        else {
            return "SELL";
        }
    };
    TradingService.prototype.getOtherAsset = function (pair, asset) {
        return pair.search(asset) === 0 ? pair.slice(asset.length) : pair.slice(0, pair.search(asset));
    };
    TradingService.prototype.calculateTriangleProfit = function (triangle) {
        var _this = this;
        if (!triangle.length) {
            console.log("Triangle is empty");
            return undefined;
        }
        var baseAsset = this.depositedCurrencies.find(function (el) { return triangle[0].symbol.search(el) >= 0; });
        if (!baseAsset) {
            console.log("Cant define baseAsset of deal", triangle[0].symbol, this.depositedCurrencies);
            return undefined;
        }
        // const side = baseAsset ? triangle[0].symbol.search(baseAsset) === 0 ? "base" : "quote" : undefined
        // if (!side) throw new Error("Cant define side of deal")
        var baseAssetAmount = new bignumber_js_1.default(config_1.BASE_CURRENCY_AMOUNT_FOR_CALCULATING);
        // console.log("CURRENT TRIANGLE", triangle.map(e => e.symbol))
        var profit = triangle.reduce(function (p, c) {
            var action = _this.getTypeOfDeal(_this.getOtherAsset(c.symbol, p.asset), c.symbol);
            if (action === "BUY") {
                // console.log(`Action: BUY. Pair: ${c.symbol}. ${p.amount} / ${c.price}`)
                return {
                    asset: c.baseAsset === p.asset ? c.quoteAsset : c.baseAsset,
                    amount: p.amount.dividedBy(new bignumber_js_1.default(c.price))
                };
            }
            else {
                // console.log(`Action: SELL. Pair: ${c.symbol}. ${p.amount} * ${c.price}`)
                return {
                    asset: c.baseAsset === p.asset ? c.quoteAsset : c.baseAsset,
                    amount: p.amount.multipliedBy(new bignumber_js_1.default(c.price))
                };
            }
        }, { asset: baseAsset, amount: baseAssetAmount });
        var profitPercents = profit.amount.dividedBy(baseAssetAmount).minus(1).multipliedBy(100);
        return {
            profit: profitPercents,
            profitString: profitPercents.toString(),
            pairs: triangle,
        };
        //old
        // const [pair1, pair2, pair3] = triangle
        // const baseCurrency: PairAndPriceObject = {
        // 	pairName: pair1.quoteAsset,
        // 	amount: new BigNumber(BASE_CURRENCY_AMOUNT_FOR_CALCULATING),
        // }
        // //buy first for second
        // const secondCurrency: PairAndPriceObject = {
        // 	pairName: pair1.baseAsset,
        // 	amount: baseCurrency.amount.dividedBy(new BigNumber(pair1.price)),
        // }
        // //sell first for third
        // const thirdCurrency: PairAndPriceObject = {
        // 	pairName: pair2.quoteAsset,
        // 	amount: secondCurrency.amount.multipliedBy(new BigNumber(pair2.price))
        // }
        // let newBaseCurrAmount: BigNumber
        // let pair3Action: TradeActionType
        // // buy first for third
        // if (pair2.quoteAsset === pair3.baseAsset) {
        // 	newBaseCurrAmount = thirdCurrency.amount.multipliedBy(new BigNumber(pair3.price))
        // 	pair3Action = "SELL"
        // } else {
        // 	newBaseCurrAmount = thirdCurrency.amount.dividedBy(new BigNumber(pair3.price))
        // 	pair3Action = "BUY"
        // }
        // const profit = newBaseCurrAmount.dividedBy(baseCurrency.amount).minus(1).multipliedBy(100)
        // return {
        // 	profitString: profit.toString(),
        // 	profit: profit,
        // 	pair1: {
        // 		pairName: pair1.symbol,
        // 		action: "BUY"
        // 	},
        // 	pair2: {
        // 		pairName: pair2.symbol,
        // 		action: "SELL"
        // 	},
        // 	pair3: {
        // 		pairName: pair3.symbol,
        // 		action: pair3Action
        // 	}
        // }
    };
    TradingService.prototype.reshuffleTriangle = function (triangle) {
        var _this = this;
        var depositAsset = "";
        var depPairs = triangle.filter(function (el) {
            var a = _this.depositedCurrencies.find(function (e) { return el.baseAsset === e; });
            var b = _this.depositedCurrencies.find(function (e) { return el.quoteAsset === e; });
            if (a) {
                depositAsset = a;
                return true;
            }
            else if (b) {
                depositAsset = b;
                return true;
            }
            else {
                return false;
            }
        });
        if (depPairs.length === 2) {
            // console.log("depPairs.length", depPairs.length)
            return {
                depositAsset: depositAsset,
                triangleData: tslib_1.__spreadArray(tslib_1.__spreadArray([
                    depPairs[0]
                ], triangle.filter(function (el) { return !_this.depositedCurrencies.includes(el.baseAsset) && !_this.depositedCurrencies.includes(el.quoteAsset); }), true), [
                    depPairs[1],
                ], false)
            };
        }
        else if (depPairs.length === 3) {
            try {
                var first_1 = triangle.find(function (e) { return e.baseAsset === depositAsset || e.quoteAsset === depositAsset; });
                var firstQuote_1 = this.getOtherAsset(first_1.symbol, depositAsset);
                var second_1 = triangle.filter(function (e) { return e.symbol !== first_1.symbol && (e.baseAsset === firstQuote_1 || e.quoteAsset === firstQuote_1); })[0];
                var third = triangle.find(function (e) { return e.symbol !== second_1.symbol && e.symbol !== first_1.symbol; });
                return {
                    triangleData: [first_1, second_1, third],
                    depositAsset: depositAsset
                };
            }
            catch (e) {
                console.log("Error:", triangle);
                return { depositAsset: depositAsset, triangleData: [] };
            }
        }
        else {
            // console.log("this.dataWithPricesCache", this.dataWithPricesCache)
            var additionalPair_1 = this.searchAdditionalPair(this.dataWithPricesCache, triangle);
            if (!additionalPair_1) {
                console.log("!additionalPair - should never happen");
                return {
                    triangleData: [],
                    depositAsset: depositAsset
                };
            }
            else {
                var quoteAsset_1 = "";
                var addBaseAsset = this.depositedCurrencies.find(function (e) { return additionalPair_1.baseAsset === e; });
                var addQueryAsset = this.depositedCurrencies.find(function (e) { return additionalPair_1.quoteAsset === e; });
                if (addBaseAsset) {
                    depositAsset = addBaseAsset;
                    quoteAsset_1 = additionalPair_1.quoteAsset;
                }
                else if (addQueryAsset) {
                    depositAsset = addQueryAsset;
                    quoteAsset_1 = additionalPair_1.baseAsset;
                }
                else {
                    throw new Error("Should never happen");
                }
                var first_2 = triangle.find(function (e) { return e.baseAsset === quoteAsset_1 || e.quoteAsset === quoteAsset_1; });
                var firstQuote_2 = this.getOtherAsset(first_2.symbol, quoteAsset_1);
                var second_2 = triangle.find(function (e) { return e.symbol !== first_2.symbol && (e.baseAsset === firstQuote_2 || e.quoteAsset === firstQuote_2); });
                var third = triangle.find(function (e) { return e.symbol !== second_2.symbol && e.symbol !== first_2.symbol; });
                var pentagon = [additionalPair_1, first_2, second_2, third, additionalPair_1];
                return {
                    depositAsset: depositAsset,
                    triangleData: pentagon
                };
            }
        }
        // const [pair1, pair2, pair3] = triangle
        // const {baseAsset: p1c1, quoteAsset: p1c2} = pair1
        // const {baseAsset: p2c1, quoteAsset: p2c2} = pair2
        // const { baseAsset: p3c1 } = pair3
        // if (p1c1 === p2c1) {
        // 	if (p1c2 === p3c1) {
        // 		return [pair2, pair1, pair3]
        // 	} else {
        // 		return [pair1, pair2, pair3]
        // 	}
        // } else if (p1c1 === p3c1) {
        // 	if (p1c2 === p2c1) {
        // 		return [pair3, pair1, pair2]
        // 	} else {
        // 		return [pair1, pair3, pair2]
        // 	}
        // } else if (p2c1 === p3c1) {
        // 	if (p2c2 === p1c1) {
        // 		return [pair3, pair2, pair1]
        // 	} else {
        // 		return [pair2, pair3, pair1]
        // 	}
        // } else {
        // 	return [pair1, pair2, pair3]
        // }
    };
    TradingService.prototype.getTr = function (originList, baseAsset) {
        var _this = this;
        var byAsset = getBasePairs(originList, [baseAsset]);
        if (byAsset[baseAsset]) {
            var triangles = constructTriangles(originList, byAsset[baseAsset], baseAsset);
            return triangles.map(function (el) {
                var calc = _this.calculateTriangleProfit(el);
                return {
                    triangleString: el.map(function (e) { return e.symbol; }).join(""),
                    triangleData: el,
                    predicatedProfit: { string: calc.profitString, bn: calc.profit },
                };
            }).filter(function (el) { return el.predicatedProfit.bn.gt(1); });
        }
        return [];
    };
    return TradingService;
}());
exports.TradingService = TradingService;
function getBasePairs(originList, baseAssets) {
    return originList.reduce(function (p, c) {
        baseAssets.forEach(function (el) {
            var _a;
            if (el === c.baseAsset || el === c.quoteAsset) {
                p = tslib_1.__assign(tslib_1.__assign({}, p), (_a = {}, _a[el] = tslib_1.__spreadArray(tslib_1.__spreadArray([], (p.hasOwnProperty(el) ? p[el] : []), true), [c], false), _a));
            }
        });
        return p;
    }, {});
}
function constructTriangles(originList, byAssetList, base) {
    return byAssetList.reduce(function (p, c) {
        var tempList = byAssetList.map(function (el) { return el; });
        var triangle;
        tempList.forEach(function (el) {
            tempList = tempList.slice(1);
            if (c.symbol !== el.symbol) {
                var _a = getTwoPairsFromTwoBases(c, el, base), first_3 = _a[0], second_3 = _a[1];
                var fd = originList.find(function (e) { return e.symbol === first_3; });
                var sd = originList.find(function (e) { return e.symbol === second_3; });
                if (fd) {
                    triangle = [c, fd, el];
                }
                else if (sd) {
                    triangle = [c, sd, el];
                }
            }
            else {
                triangle = undefined;
            }
        });
        if (triangle) {
            return tslib_1.__spreadArray(tslib_1.__spreadArray([], p, true), [triangle], false);
        }
        return p;
    }, []);
}
function getTwoPairsFromTwoBases(firstPair, secondPair, base) {
    var firstAsset = firstPair.baseAsset === base ? firstPair.quoteAsset : firstPair.baseAsset;
    var secondAsset = secondPair.baseAsset === base ? secondPair.quoteAsset : secondPair.baseAsset;
    return ["".concat(firstAsset).concat(secondAsset), "".concat(secondAsset).concat(firstAsset)];
}
exports.getTwoPairsFromTwoBases = getTwoPairsFromTwoBases;
