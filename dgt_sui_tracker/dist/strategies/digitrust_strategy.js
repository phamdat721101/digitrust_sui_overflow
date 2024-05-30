"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigiTrustStrategy = void 0;
const data_point_1 = require("../data_sources/data_point");
const simple_statistics_1 = require("simple-statistics");
const strategy_1 = require("./strategy");
class DigiTrustStrategy extends strategy_1.Strategy {
    short;
    long;
    lastDecision = 0;
    pool;
    latestPoolPrice = 0;
    history = [];
    limit;
    defaultAmounts;
    exchange;
    priceRatio;
    constructor(pool, data_source, short, long, defaultAmounts, limit, priceRatio, name) {
        super({
            name: name,
            pool: pool,
            exchange: data_source,
            short: short,
            long: long,
        });
        this.short = short;
        this.long = long;
        this.pool = pool;
        this.exchange = data_source;
        this.defaultAmounts = defaultAmounts;
        this.limit = limit;
        this.priceRatio = priceRatio;
    }
    evaluate(data) {
        console.log(data);
        if (data.type != data_point_1.DataType.Price) {
            return [];
        }
        if (data.source_uri == this.pool) {
            this.latestPoolPrice = data.price;
            return [];
        }
        this.lastDecision++;
        let price = data.price;
        this.history.push(price);
        if (this.history.length < this.long) {
            return [];
        }
        if (this.history.length > this.long) {
            this.history.shift();
        }
        let short_average = (0, simple_statistics_1.average)(this.history.slice(this.history.length - this.short, this.history.length));
        let long_average = (0, simple_statistics_1.average)(this.history);
        this.logStatus({
            pool: this.latestPoolPrice,
            exchange: price,
            short_average: short_average,
            long_average: long_average,
        });
        if (this.lastDecision > this.long + 1) {
            if (short_average / long_average < 1 / this.limit) {
                if (price > this.latestPoolPrice * this.priceRatio) {
                    return [];
                }
                this.lastDecision = 0;
                return [
                    {
                        pool: this.pool,
                        amountIn: this.defaultAmounts[0],
                        estimatedPrice: this.latestPoolPrice,
                        a2b: true,
                    },
                ];
            }
            else if (short_average / long_average > this.limit) {
                this.lastDecision = 0;
                if (price < this.latestPoolPrice / this.priceRatio) {
                    return [];
                }
                return [
                    {
                        pool: this.pool,
                        amountIn: this.defaultAmounts[1],
                        estimatedPrice: 1 / this.latestPoolPrice,
                        a2b: false,
                    },
                ];
            }
        }
        return [];
    }
    subscribes_to() {
        return [this.pool, this.exchange];
    }
}
exports.DigiTrustStrategy = DigiTrustStrategy;
