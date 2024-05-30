"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigiTrustVault = void 0;
const sui_js_1 = require("@mysten/sui.js");
const promises_1 = require("timers/promises");
const cetus_1 = require("./dexs/cetus/cetus");
const suiswap_1 = require("./dexs/suiswap/suiswap");
const logger_1 = require("./logger");
class DigiTrustVault {
    dataSources = {};
    pools = {};
    strategies = {};
    keypair;
    provider;
    signer;
    constructor(keypair) {
        this.keypair = keypair;
        this.provider = new sui_js_1.JsonRpcProvider(sui_js_1.testnetConnection);
        this.signer = new sui_js_1.RawSigner(this.keypair, this.provider);
    }
    async loop(duration, delay) {
        let startTime = new Date().getTime();
        let uniqueStrategies = {};
        for (const pool in this.strategies) {
            for (const strategy of this.strategies[pool]) {
                if (!uniqueStrategies.hasOwnProperty(strategy.uri)) {
                    uniqueStrategies[strategy.uri] = strategy["parameters"];
                }
            }
        }
        let transactionBlock = new sui_js_1.TransactionBlock();
        while (new Date().getTime() - startTime < duration) {
            for (const uri in this.dataSources) {
                let dataSource = this.dataSources[uri];
                let data = await dataSource.getData();
                for (const strategy of this.strategies[uri]) {
                    let tradeOrders = strategy.evaluate(data);
                    transactionBlock = new sui_js_1.TransactionBlock();
                    for (const order of tradeOrders) {
                        logger_1.logger.info({ strategy: strategy.uri, decision: order }, "order");
                        let amountIn = Math.round(order.amountIn);
                        let amountOut = Math.round(order.estimatedPrice * amountIn);
                        const a2b = order.a2b;
                        const byAmountIn = true;
                        const slippage = 1;
                        if (this.pools[order.pool] instanceof cetus_1.CetusPool) {
                            transactionBlock = await this.pools[order.pool].createSwapTransaction(transactionBlock, {
                                a2b,
                                amountIn,
                                amountOut,
                                byAmountIn,
                                slippage,
                            });
                        }
                        else if (this.pools[order.pool] instanceof suiswap_1.SuiswapPool) {
                            transactionBlock = await this.pools[order.pool].createSwapTransaction(transactionBlock, {
                                a2b,
                                amountIn,
                            });
                        }
                    }
                    let resp = await this.executeTransactionBlock(transactionBlock, strategy);
                    console.log("Tx resp: ", resp, "Tx_block: ", transactionBlock, " -strategy: ", strategy);
                }
            }
            await (0, promises_1.setTimeout)(delay);
        }
    }
    async executeTransactionBlock(transactionBlock, strategy) {
        if (transactionBlock.blockData.transactions.length !== 0) {
            try {
                transactionBlock.setGasBudget(1500000000);
                let result = await this.signer.signAndExecuteTransactionBlock({
                    transactionBlock,
                    requestType: "WaitForLocalExecution",
                    options: {
                        showObjectChanges: true,
                        showEffects: true,
                    },
                });
                logger_1.logger.info({ strategy: strategy, transaction: result }, "transaction");
            }
            catch (e) {
                console.log("Tx error: ", e);
                logger_1.logger.error(e);
            }
        }
    }
    addStrategy(strategy) {
        for (const dataSource of strategy.subscribes_to()) {
            if (!this.dataSources.hasOwnProperty(dataSource)) {
                throw new Error("Bot does not know the dataSource with address " + dataSource);
            }
            this.strategies[dataSource].push(strategy);
        }
    }
    addDataSource(dataSource) {
        if (this.dataSources.hasOwnProperty(dataSource.uri)) {
            throw new Error("Data source " + dataSource.uri + " has already been added.");
        }
        this.dataSources[dataSource.uri] = dataSource;
        this.strategies[dataSource.uri] = [];
    }
    addPool(pool) {
        if (this.pools.hasOwnProperty(pool.uri)) {
            throw new Error("Pool " + pool.uri + " has already been added.");
        }
        this.pools[pool.uri] = pool;
        this.addDataSource(pool);
    }
}
exports.DigiTrustVault = DigiTrustVault;
