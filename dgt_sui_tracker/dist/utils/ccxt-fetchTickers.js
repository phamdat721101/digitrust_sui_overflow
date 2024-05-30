"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.binanceFetchTickersAll = exports.okxFetchTickers = exports.kucoinFetchTickers = exports.krakenFetchTickers = exports.coinbaseprimeFetchTickers = exports.bitgetFetchTickers = exports.binanceFetchTickers = void 0;
const ccxt_1 = require("ccxt");
const binanceExchange = new ccxt_1.binance({ enableRateLimit: true });
const bitgetExchange = new ccxt_1.bitget({ enableRateLimit: true });
const coinbaseprimeExchange = new ccxt_1.coinbaseprime({ enableRateLimit: true });
const krakenExchange = new ccxt_1.kraken({ enableRateLimit: true });
const kucoinExchange = new ccxt_1.kucoin({ enableRateLimit: true });
const okxExchange = new ccxt_1.okx({ enableRateLimit: true });
async function exchangeFetchTickers(exchange, pairs) {
    const map = new Map();
    const response = await exchange.fetchTickers(pairs);
    for (let pair in response)
        map.set(response[pair].symbol, response[pair].last);
    return map;
}
async function binanceFetchTickers(pairs) {
    return await exchangeFetchTickers(binanceExchange, pairs);
}
exports.binanceFetchTickers = binanceFetchTickers;
async function bitgetFetchTickers(pairs) {
    return await exchangeFetchTickers(bitgetExchange, pairs);
}
exports.bitgetFetchTickers = bitgetFetchTickers;
async function coinbaseprimeFetchTickers(pairs) {
    return await exchangeFetchTickers(coinbaseprimeExchange, pairs);
}
exports.coinbaseprimeFetchTickers = coinbaseprimeFetchTickers;
async function krakenFetchTickers(pairs) {
    return await exchangeFetchTickers(krakenExchange, pairs);
}
exports.krakenFetchTickers = krakenFetchTickers;
async function kucoinFetchTickers(pairs) {
    return await exchangeFetchTickers(kucoinExchange, pairs);
}
exports.kucoinFetchTickers = kucoinFetchTickers;
async function okxFetchTickers(pairs) {
    return await exchangeFetchTickers(okxExchange, pairs);
}
exports.okxFetchTickers = okxFetchTickers;
async function binanceFetchTickersAll() {
    const map = new Map();
    return map;
}
exports.binanceFetchTickersAll = binanceFetchTickersAll;
