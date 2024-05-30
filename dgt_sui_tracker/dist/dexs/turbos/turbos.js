"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TurbosPool = void 0;
const sui_js_1 = require("@mysten/sui.js");
const bn_js_1 = __importDefault(require("bn.js"));
const decimal_js_1 = __importDefault(require("decimal.js"));
const turbos_clmm_sdk_1 = require("turbos-clmm-sdk");
const index_1 = require("../../index");
const utils_1 = require("../../utils/utils");
const mainnet_config_1 = require("../cetus/mainnet_config");
const testnet_config_1 = require("../cetus/testnet_config");
const dexsConfig_1 = require("../dexsConfig");
const pool_1 = require("../pool");
const constants_1 = require("./constants");
const ONE_MINUTE = 60 * 1000;
var sdkEnv;
(function (sdkEnv) {
    sdkEnv["mainnet"] = "mainnet";
    sdkEnv["testnet"] = "testnet";
})(sdkEnv || (sdkEnv = {}));
const currSdkEnv = sdkEnv.mainnet;
function buildSdkOptions() {
    switch (currSdkEnv) {
        case sdkEnv.mainnet:
            return mainnet_config_1.mainnet;
        case sdkEnv.testnet:
            return testnet_config_1.testnet;
    }
}
class TurbosPool extends pool_1.Pool {
    sdk;
    package;
    module;
    senderAddress;
    versioned;
    coinTypeC;
    provider;
    constructor(address, coinTypeA, coinTypeB, coinTypeC) {
        super(address, coinTypeA, coinTypeB);
        this.coinTypeC = coinTypeC;
        this.senderAddress = index_1.keypair.getPublicKey().toSuiAddress();
        this.package = dexsConfig_1.turbosConfig.contract.PackageId;
        this.module = dexsConfig_1.turbosConfig.contract.ModuleId;
        this.versioned = dexsConfig_1.turbosConfig.contract.Versioned;
        this.provider = new sui_js_1.JsonRpcProvider(sui_js_1.mainnetConnection);
        this.sdk = new turbos_clmm_sdk_1.TurbosSdk(turbos_clmm_sdk_1.Network.mainnet, this.provider);
        this.provider = new sui_js_1.JsonRpcProvider(sui_js_1.mainnetConnection);
        this.senderAddress = index_1.keypair.getPublicKey().toSuiAddress();
    }
    async createSwapTransaction(transactionBlock, params) {
        const totalBalance = await (0, utils_1.getTotalBalanceByCoinType)(this.provider, this.senderAddress, params.a2b ? this.coinTypeA : this.coinTypeB);
        console.log(`TotalBalance for CoinType (${params.a2b ? this.coinTypeA : this.coinTypeB}), is: ${totalBalance} and amountIn is: ${params.amountIn}`);
        if (params.amountIn > 0 && Number(totalBalance) >= params.amountIn) {
            if (!params.a2b &&
                this.uri ===
                    "0x5eb2dfcdd1b15d2021328258f6d5ec081e9a0cdcfa9e13a0eaeb9b5f7505ca78")
                return transactionBlock;
            return await this.createTurbosTransactionBlockWithSDK(transactionBlock, params);
        }
        return transactionBlock;
    }
    async createTransactionBlock(a2b, amountIn, amountSpecifiedIsInput, slippage) {
        console.log(`Swap: (${amountIn}) [${a2b ? this.coinTypeA : this.coinTypeB}], 
       To: [${!a2b ? this.coinTypeA : this.coinTypeB}], 
       pool: ${this.uri}`);
        const admin = process.env.ADMIN_ADDRESS;
        const functionName = a2b ? "swap_a_b" : "swap_b_a";
        const transactionBlock = new sui_js_1.TransactionBlock();
        const coins = await (0, utils_1.buildInputCoinForAmount)(transactionBlock, BigInt(amountIn), a2b ? this.coinTypeA : this.coinTypeB, admin, this.provider);
        if (typeof coins !== "undefined") {
            transactionBlock.moveCall({
                target: `${this.package}::${this.module}::${functionName}`,
                arguments: [
                    transactionBlock.object(this.uri),
                    transactionBlock.makeMoveVec({
                        objects: coins,
                    }),
                    transactionBlock.pure(amountIn.toFixed(0), "u64"),
                    transactionBlock.pure(amountOutWithSlippage(amountIn, slippage.toString(), amountSpecifiedIsInput), "u64"),
                    transactionBlock.pure(tickIndexToSqrtPriceX64(a2b ? constants_1.MIN_TICK_INDEX : constants_1.MAX_TICK_INDEX).toString(), "u128"),
                    transactionBlock.pure(amountSpecifiedIsInput, "bool"),
                    transactionBlock.object(this.senderAddress),
                    transactionBlock.pure(Date.now() + ONE_MINUTE * 3, "u64"),
                    transactionBlock.object(sui_js_1.SUI_CLOCK_OBJECT_ID),
                    transactionBlock.object(this.versioned),
                ],
                typeArguments: [this.coinTypeA, this.coinTypeB, this.coinTypeC],
            });
            return transactionBlock;
        }
        return undefined;
    }
    async createTurbosTransactionBlockWithSDK(transactionBlock, params) {
        console.log("createTurbosTransactionBlockWithSDK, a2b: ", params.a2b);
        const swapResult = await this.sdk.trade.computeSwapResult({
            pool: this.uri,
            a2b: params.a2b,
            address: this.senderAddress,
            amountSpecified: params.amountIn,
            amountSpecifiedIsInput: params.amountSpecifiedIsInput,
        });
        console.log("swapResult: ", swapResult);
        return this.sdk.trade.swap({
            routes: [
                {
                    pool: swapResult.pool,
                    a2b: swapResult.a_to_b,
                    nextTickIndex: this.sdk.math.bitsToNumber(swapResult.tick_current_index.bits),
                },
            ],
            coinTypeA: swapResult.a_to_b ? this.coinTypeA : this.coinTypeB,
            coinTypeB: swapResult.a_to_b ? this.coinTypeB : this.coinTypeA,
            address: swapResult.recipient,
            amountA: swapResult.amount_a,
            amountB: swapResult.amount_b,
            amountSpecifiedIsInput: params.amountSpecifiedIsInput,
            slippage: params.slippage.toString(),
            txb: transactionBlock,
        });
    }
    async estimatePriceAndFee() {
        const obj = await this.provider.getObject({
            id: this.uri,
            options: { showContent: true, showType: true },
        });
        let objFields = null;
        if (obj && obj.data?.content?.dataType === "moveObject") {
            objFields = (0, sui_js_1.getObjectFields)(obj);
        }
        const current_sqrt_price = objFields?.sqrt_price;
        const price = new decimal_js_1.default(current_sqrt_price.toString())
            .mul(decimal_js_1.default.pow(2, -64))
            .pow(2);
        const fee = objFields?.fee * 10 ** -6;
        return {
            price: price.toNumber(),
            fee,
        };
    }
    addToTransactionBlock(transactionBlock, txbToBeAdded) {
        return transactionBlock;
    }
}
exports.TurbosPool = TurbosPool;
function sqrtPriceX64ToPrice(sqrtPriceX64, decimalsA, decimalsB) {
    return new decimal_js_1.default(sqrtPriceX64.toString())
        .mul(decimal_js_1.default.pow(2, -64))
        .pow(2)
        .mul(decimal_js_1.default.pow(10, decimalsA - decimalsB));
}
function amountOutWithSlippage(amountOut, slippage, amountSpecifiedIsInput) {
    if (amountSpecifiedIsInput) {
        const minus = new decimal_js_1.default(100).minus(slippage).div(100);
        return new decimal_js_1.default(amountOut).mul(minus).toFixed(0);
    }
    const plus = new decimal_js_1.default(100).plus(slippage).div(100);
    return new decimal_js_1.default(amountOut).mul(plus).toFixed(0);
}
function tickIndexToSqrtPriceX64(tickIndex) {
    if (tickIndex > 0) {
        return new bn_js_1.default(tickIndexToSqrtPricePositive(tickIndex));
    }
    else {
        return new bn_js_1.default(tickIndexToSqrtPriceNegative(tickIndex));
    }
}
function tickIndexToSqrtPriceNegative(tickIndex) {
    let tick = Math.abs(tickIndex);
    let ratio;
    if ((tick & 1) != 0) {
        ratio = new bn_js_1.default("18445821805675392311");
    }
    else {
        ratio = new bn_js_1.default("18446744073709551616");
    }
    if ((tick & 2) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("18444899583751176498")), 64, 256);
    }
    if ((tick & 4) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("18443055278223354162")), 64, 256);
    }
    if ((tick & 8) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("18439367220385604838")), 64, 256);
    }
    if ((tick & 16) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("18431993317065449817")), 64, 256);
    }
    if ((tick & 32) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("18417254355718160513")), 64, 256);
    }
    if ((tick & 64) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("18387811781193591352")), 64, 256);
    }
    if ((tick & 128) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("18329067761203520168")), 64, 256);
    }
    if ((tick & 256) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("18212142134806087854")), 64, 256);
    }
    if ((tick & 512) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("17980523815641551639")), 64, 256);
    }
    if ((tick & 1024) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("17526086738831147013")), 64, 256);
    }
    if ((tick & 2048) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("16651378430235024244")), 64, 256);
    }
    if ((tick & 4096) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("15030750278693429944")), 64, 256);
    }
    if ((tick & 8192) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("12247334978882834399")), 64, 256);
    }
    if ((tick & 16384) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("8131365268884726200")), 64, 256);
    }
    if ((tick & 32768) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("3584323654723342297")), 64, 256);
    }
    if ((tick & 65536) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("696457651847595233")), 64, 256);
    }
    if ((tick & 131072) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("26294789957452057")), 64, 256);
    }
    if ((tick & 262144) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("37481735321082")), 64, 256);
    }
    return ratio;
}
function tickIndexToSqrtPricePositive(tick) {
    let ratio;
    if ((tick & 1) != 0) {
        ratio = new bn_js_1.default("79232123823359799118286999567");
    }
    else {
        ratio = new bn_js_1.default("79228162514264337593543950336");
    }
    if ((tick & 2) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("79236085330515764027303304731")), 96, 256);
    }
    if ((tick & 4) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("79244008939048815603706035061")), 96, 256);
    }
    if ((tick & 8) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("79259858533276714757314932305")), 96, 256);
    }
    if ((tick & 16) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("79291567232598584799939703904")), 96, 256);
    }
    if ((tick & 32) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("79355022692464371645785046466")), 96, 256);
    }
    if ((tick & 64) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("79482085999252804386437311141")), 96, 256);
    }
    if ((tick & 128) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("79736823300114093921829183326")), 96, 256);
    }
    if ((tick & 256) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("80248749790819932309965073892")), 96, 256);
    }
    if ((tick & 512) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("81282483887344747381513967011")), 96, 256);
    }
    if ((tick & 1024) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("83390072131320151908154831281")), 96, 256);
    }
    if ((tick & 2048) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("87770609709833776024991924138")), 96, 256);
    }
    if ((tick & 4096) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("97234110755111693312479820773")), 96, 256);
    }
    if ((tick & 8192) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("119332217159966728226237229890")), 96, 256);
    }
    if ((tick & 16384) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("179736315981702064433883588727")), 96, 256);
    }
    if ((tick & 32768) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("407748233172238350107850275304")), 96, 256);
    }
    if ((tick & 65536) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("2098478828474011932436660412517")), 96, 256);
    }
    if ((tick & 131072) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("55581415166113811149459800483533")), 96, 256);
    }
    if ((tick & 262144) != 0) {
        ratio = signedShiftRight(ratio.mul(new bn_js_1.default("38992368544603139932233054999993551")), 96, 256);
    }
    return signedShiftRight(ratio, 32, 256);
}
function signedShiftRight(n0, shiftBy, bitWidth) {
    let twoN0 = n0.toTwos(bitWidth).shrn(shiftBy);
    twoN0.imaskn(bitWidth - shiftBy + 1);
    return twoN0.fromTwos(bitWidth - shiftBy);
}
