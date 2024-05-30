"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pool = void 0;
const data_point_1 = require("../data_sources/data_point");
const data_source_1 = require("../data_sources/data_source");
class Pool extends data_source_1.DataSource {
    coinTypeA;
    coinTypeB;
    constructor(address, coinTypeA, coinTypeB) {
        super(address);
        this.coinTypeA = coinTypeA;
        this.coinTypeB = coinTypeB;
    }
    async getData() {
        let priceAndFee = await this.estimatePriceAndFee();
        return {
            type: data_point_1.DataType.Price,
            source_uri: this.uri,
            coinTypeFrom: this.coinTypeA,
            coinTypeTo: this.coinTypeB,
            price: priceAndFee.price,
            fee: priceAndFee.fee,
        };
    }
}
exports.Pool = Pool;
