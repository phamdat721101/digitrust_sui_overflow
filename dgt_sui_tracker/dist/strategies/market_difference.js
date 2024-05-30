"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketDifference = void 0;
const strategy_1 = require("./strategy");
const data_point_1 = require("../data_sources/data_point");
class MarketDifference extends strategy_1.Strategy {
    pool;
    exchange;
    latestExchangePrice;
    limit;
    defaultAmounts;
    constructor(pool, exchange, defaultAmounts, limit, name) {
        super({
            name: name,
            pool: pool.uri,
            exchange: exchange,
        });
        this.pool = pool;
        this.exchange = exchange;
        this.defaultAmounts = defaultAmounts;
        this.limit = limit;
    }
    evaluate(data) {
        if (data.type != data_point_1.DataType.Price) {
            return [];
        }
        let price = data.price;
        if (data.source_uri != this.pool.uri) {
            this.latestExchangePrice = price;
            return [];
        }
        if (this.latestExchangePrice == undefined) {
            return [];
        }
        let priceRatio = this.latestExchangePrice / price;
        this.logStatus({
            poolPrice: price,
            exchangePrice: this.latestExchangePrice,
        });
        if (priceRatio * (1 - data.fee) > this.limit) {
            return [
                {
                    pool: this.pool.uri,
                    amountIn: this.defaultAmounts[1],
                    estimatedPrice: 1 / price,
                    a2b: false,
                },
            ];
        }
        else if ((1 - data.fee) / priceRatio > this.limit) {
            return [
                {
                    pool: this.pool.uri,
                    amountIn: this.defaultAmounts[0],
                    estimatedPrice: price,
                    a2b: true,
                },
            ];
        }
        return [];
    }
    subscribes_to() {
        return [this.pool.uri].concat(this.exchange);
    }
}
exports.MarketDifference = MarketDifference;
