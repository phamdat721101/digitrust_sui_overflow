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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CetusPool = void 0;
const dist_1 = __importStar(require("@cetusprotocol/cetus-sui-clmm-sdk/dist"));
const sui_js_1 = require("@mysten/sui.js");
const bn_js_1 = __importDefault(require("bn.js"));
const coins_1 = require("../../coins/coins");
const index_1 = require("../../index");
const utils_1 = require("../../utils/utils");
const pool_1 = require("../pool");
const mainnet_config_1 = require("./mainnet_config");
function buildSdkOptions() {
    return mainnet_config_1.mainnet;
}
class CetusPool extends pool_1.Pool {
    sdk;
    provider;
    senderAddress;
    constructor(address, coinTypeA, coinTypeB) {
        super(address, coinTypeA, coinTypeB);
        this.sdk = new dist_1.default(buildSdkOptions());
        this.sdk.senderAddress = index_1.keypair.getPublicKey().toSuiAddress();
        this.provider = new sui_js_1.JsonRpcProvider(sui_js_1.mainnetConnection);
        this.senderAddress = index_1.keypair.getPublicKey().toSuiAddress();
    }
    async createSwapTransaction(transactionBlock, params) {
        const totalBalance = await (0, utils_1.getTotalBalanceByCoinType)(this.provider, this.senderAddress, params.a2b ? this.coinTypeA : this.coinTypeB);
        console.log(`TotalBalance for CoinType (${params.a2b ? this.coinTypeA : this.coinTypeB}), is: ${totalBalance} and amountIn is: ${params.amountIn}`);
        if (params.amountIn > 0 && Number(totalBalance) >= params.amountIn) {
            const txb = await this.createCetusTransactionBlockWithSDK(params);
            let target = "";
            let args = [];
            let typeArguments = [];
            let coins = [];
            let packageName = "";
            let moduleName = "";
            let functionName = "";
            const moveCall = txb.blockData.transactions.find((obj) => {
                if (obj.kind === "MoveCall")
                    return obj.target;
            });
            if (moveCall?.kind === "MoveCall" && moveCall?.target) {
                target = moveCall.target;
                [packageName, moduleName, functionName] = target.split("::");
            }
            const inputs = txb.blockData.inputs;
            args = [];
            inputs.forEach((input) => {
                if (input.kind === "Input" &&
                    (input.type === "object" || input.type === "pure"))
                    args.push(input.value);
            });
            if (moveCall?.kind === "MoveCall" && moveCall?.typeArguments)
                typeArguments = moveCall.typeArguments;
            let makeMoveVec = txb.blockData.transactions.find((obj) => {
                if (obj.kind === "MakeMoveVec")
                    return obj;
            });
            if (makeMoveVec?.kind === "MakeMoveVec" && makeMoveVec?.objects)
                coins = makeMoveVec.objects
                    .filter((obj) => obj.kind === "Input" && obj.value)
                    .map((obj) => obj.kind === "Input" && obj?.value ? obj.value : null);
            args = args.filter((item) => !coins.includes(item));
            transactionBlock.moveCall({
                target: `${packageName}::${moduleName}::${functionName}`,
                arguments: [
                    transactionBlock.object(args[0]),
                    transactionBlock.object(args[1]),
                    transactionBlock.makeMoveVec({
                        objects: coins.map((id) => transactionBlock.object(id)),
                    }),
                    transactionBlock.pure(args[2]),
                    transactionBlock.pure(args[3]),
                    transactionBlock.pure(args[4]),
                    transactionBlock.pure(args[5]),
                    transactionBlock.object(sui_js_1.SUI_CLOCK_OBJECT_ID),
                ],
                typeArguments,
            });
            return transactionBlock;
        }
        return transactionBlock;
    }
    async estimatePriceAndFee() {
        let pool = await this.sdk.Pool.getPool(this.uri);
        let price = pool.current_sqrt_price ** 2 / 2 ** 128;
        let fee = pool.fee_rate * 10 ** -6;
        return {
            price,
            fee,
        };
    }
    async createCetusTransactionBlockWithSDK(params) {
        console.log(`a2b: ${params.a2b}, amountIn: ${params.amountIn}, amountOut: ${params.amountOut}, byAmountIn: ${params.byAmountIn}, slippage: ${params.slippage}`);
        const coinAmount = new bn_js_1.default(params.amountIn);
        const byAmountIn = true;
        const slippage = dist_1.Percentage.fromDecimal((0, dist_1.d)(5));
        const pool = await this.sdk.Pool.getPool(this.uri);
        let coinA = (0, coins_1.getCoinInfo)(this.coinTypeA);
        let coinB = (0, coins_1.getCoinInfo)(this.coinTypeB);
        const res = await this.sdk.Swap.preswap({
            a2b: params.a2b,
            amount: coinAmount.toString(),
            by_amount_in: byAmountIn,
            coinTypeA: this.coinTypeA,
            coinTypeB: this.coinTypeB,
            current_sqrt_price: pool.current_sqrt_price,
            decimalsA: coinA.decimals,
            decimalsB: coinB.decimals,
            pool: pool,
        });
        const toAmount = byAmountIn
            ? res.estimatedAmountOut
            : res.estimatedAmountIn;
        const amountLimit = (0, dist_1.adjustForSlippage)(new bn_js_1.default(toAmount), slippage, !byAmountIn);
        const transactionBlock = await this.sdk.Swap.createSwapTransactionPayload({
            pool_id: pool.poolAddress,
            coinTypeA: pool.coinTypeA,
            coinTypeB: pool.coinTypeB,
            a2b: params.a2b,
            by_amount_in: byAmountIn,
            amount: res.amount.toString(),
            amount_limit: amountLimit.toString(),
        });
        return transactionBlock;
    }
}
exports.CetusPool = CetusPool;
