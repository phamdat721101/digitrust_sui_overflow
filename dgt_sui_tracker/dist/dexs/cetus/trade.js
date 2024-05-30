"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trade = void 0;
const cetus_sui_clmm_sdk_1 = __importStar(require("@cetusprotocol/cetus-sui-clmm-sdk"));
const config_1 = require("./config");
const create_signer_1 = require("./create_signer");
const bn_js_1 = require("bn.js");
async function trade(_pool, _a2b, _byAmountIn, _amount, _slippage) {
    const cetusInstance = new cetus_sui_clmm_sdk_1.default(config_1.testnet);
    const signer = (0, create_signer_1.create_signer)();
    cetusInstance.senderAddress = signer.getPublicKey().toSuiAddress();
    const pool = await cetusInstance.Pool.getPool(_pool);
    const a2b = _a2b;
    const byAmountIn = _byAmountIn;
    const amount = new bn_js_1.BN(_amount);
    const slippage = cetus_sui_clmm_sdk_1.Percentage.fromDecimal((0, cetus_sui_clmm_sdk_1.d)(_slippage));
    const swapTicks = await cetusInstance.Pool.fetchTicks({
        pool_id: pool.poolAddress,
        coinTypeA: pool.coinTypeA,
        coinTypeB: pool.coinTypeB,
    });
    const calcResult = cetusInstance.Swap.calculateRates({
        decimalsA: 0,
        decimalsB: 9,
        a2b,
        byAmountIn,
        amount,
        swapTicks,
        currentPool: pool,
    });
    const toAmount = byAmountIn
        ? calcResult.estimatedAmountOut
        : calcResult.estimatedAmountIn;
    const amountLimit = (0, cetus_sui_clmm_sdk_1.adjustForSlippage)(toAmount, slippage, !byAmountIn);
    const swapPayload = await cetusInstance.Swap.createSwapTransactionPayload({
        pool_id: pool.poolAddress,
        coinTypeA: pool.coinTypeA,
        coinTypeB: pool.coinTypeB,
        a2b,
        by_amount_in: byAmountIn,
        amount: calcResult.amount.toString(),
        amount_limit: amountLimit.toString(),
    });
    const tradeTxn = await cetusInstance.fullClient.sendTransaction(signer, swapPayload);
    console.log(`[${new Date().toLocaleString()}] Swap Transaction Digest: ${tradeTxn?.digest}`);
    return tradeTxn?.digest;
}
exports.trade = trade;
