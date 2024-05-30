"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinanceBTCtoUSDC = void 0;
const data_source_1 = require("../data_source");
const data_point_1 = require("../data_point");
const binance_ticker_price_1 = require("../../utils/binance-ticker-price");
const utils_1 = require("../../utils/utils");
const index_1 = require("../../index");
class BinanceBTCtoUSDC extends data_source_1.DataSource {
    constructor() {
        super("BinanceBTCtoUSDC");
    }
    getData() {
        return (0, binance_ticker_price_1.BTCtoUSDC)().then(value => {
            let parsed = Number(value);
            let price = 10 ** ((0, utils_1.getCoinDecimals)(index_1.coins.WBTC) - (0, utils_1.getCoinDecimals)(index_1.coins.USDC)) / parsed;
            return {
                type: data_point_1.DataType.Price,
                source_uri: "pqd_pn",
                coinTypeFrom: "0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN",
                coinTypeTo: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
                price: price,
                fee: 0,
            };
        });
    }
}
exports.BinanceBTCtoUSDC = BinanceBTCtoUSDC;
