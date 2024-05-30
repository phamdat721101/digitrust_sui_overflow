"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Arbitrage = void 0;
const data_point_1 = require("../data_sources/data_point");
const strategy_1 = require("./strategy");
class Arbitrage extends strategy_1.Strategy {
    lowerLimit;
    poolChain;
    poolChainAsString;
    latestRate = {};
    latestFee = {};
    defaultAmount;
    constructor(poolChain, defaultAmount, relativeLimit, name) {
        super({
            name: name,
            poolChain: poolChain,
        });
        this.poolChain = poolChain;
        this.defaultAmount = defaultAmount;
        this.lowerLimit = relativeLimit;
        this.poolChainAsString = this.poolChain.map(p => p.pool.substring(0, 8)).toString();
    }
    evaluate(data) {
        if (data.type != data_point_1.DataType.Price || !this.poolChain.map(p => p.pool).includes(data.source_uri)) {
            return [];
        }
        this.latestRate[data.source_uri] = data.price;
        this.latestFee[data.source_uri] = data.fee;
        let arbitrage = 1;
        let arbitrageReverse = 1;
        for (const pool of this.poolChain) {
            let rate = this.getLatestRate(pool.pool, pool.a2b);
            if (rate == undefined) {
                return [];
            }
            arbitrage *= (1 - this.latestFee[pool.pool]) * rate;
            arbitrageReverse *= (1 - this.latestFee[pool.pool]) * (1 / rate);
        }
        this.logStatus({ arbitrage: arbitrage, reverse: arbitrageReverse });
        if (arbitrage > this.lowerLimit) {
            let orders = [];
            let amountIn = this.defaultAmount;
            for (const pool of this.poolChain) {
                let latestRate = this.getLatestRate(pool.pool, pool.a2b);
                orders.push({
                    pool: pool.pool,
                    amountIn: amountIn,
                    estimatedPrice: latestRate,
                    a2b: pool.a2b
                });
                amountIn = amountIn * latestRate;
            }
            return orders;
        }
        else if (arbitrageReverse > this.lowerLimit) {
            let orders = [];
            let amount = this.defaultAmount;
            for (const pool of this.poolChain.reverse()) {
                let latestRate = this.getLatestRate(pool.pool, !pool.a2b);
                orders.push({
                    pool: pool.pool,
                    amountIn: amount,
                    estimatedPrice: latestRate,
                    a2b: !pool.a2b
                });
                amount = amount * latestRate;
            }
            return orders;
        }
        return [];
    }
    subscribes_to() {
        return this.poolChain.map(value => value.pool);
    }
    getLatestRate(pool, a2b) {
        return a2b ? this.latestRate[pool] : 1 / this.latestRate[pool];
    }
}
exports.Arbitrage = Arbitrage;
