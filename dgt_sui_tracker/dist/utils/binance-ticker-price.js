"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUItoTRY = exports.SUItoEUR = exports.SUItoBNB = exports.SUItoBTC = exports.SUItoTUSD = exports.SUItoUSDT = exports.BTCtoUSDC = exports.BTCtoUSDT = void 0;
const connector_1 = require("@binance/connector");
const client = new connector_1.Spot();
async function getTickerPrice(symbol) {
    const tickerPrice = await client.tickerPrice(symbol);
    return tickerPrice.data.price;
}
async function BTCtoUSDT() {
    const price = await getTickerPrice("BTCUSDT");
    return price;
}
exports.BTCtoUSDT = BTCtoUSDT;
async function BTCtoUSDC() {
    const price = await getTickerPrice("BTCUSDC");
    return price;
}
exports.BTCtoUSDC = BTCtoUSDC;
async function SUItoUSDT() {
    const price = await getTickerPrice("SUIUSDT");
    return price;
}
exports.SUItoUSDT = SUItoUSDT;
async function SUItoTUSD() {
    const price = await getTickerPrice("SUITUSD");
    return price;
}
exports.SUItoTUSD = SUItoTUSD;
async function SUItoBTC() {
    const price = await getTickerPrice("SUIBTC");
    return price;
}
exports.SUItoBTC = SUItoBTC;
async function SUItoBNB() {
    const price = await getTickerPrice("SUIBNB");
    return price;
}
exports.SUItoBNB = SUItoBNB;
async function SUItoEUR() {
    const price = await getTickerPrice("SUIEUR");
    return price;
}
exports.SUItoEUR = SUItoEUR;
async function SUItoTRY() {
    const price = await getTickerPrice("SUITRY");
    return price;
}
exports.SUItoTRY = SUItoTRY;
