"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigiTrustPool = void 0;
const sui_js_1 = require("@mysten/sui.js");
const index_1 = require("../../index");
const utils_1 = require("../../utils/utils");
const mainnet_config_1 = require("../cetus/mainnet_config");
const testnet_config_1 = require("../cetus/testnet_config");
const pool_1 = require("../pool");
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
class DigiTrustPool extends pool_1.Pool {
    package;
    module;
    senderAddress;
    constructor(address, coinTypeA, coinTypeB) {
        super(address, coinTypeA, coinTypeB);
        this.senderAddress = index_1.keypair.getPublicKey().toSuiAddress();
        this.package = '';
        this.module = '';
    }
    async createSwapTransaction(transactionBlock, params) {
        console.log(`Swap: ${params.amountIn}`);
        let provider = new sui_js_1.JsonRpcProvider(sui_js_1.testnetConnection);
        const privkey = '0x5d1337db6186b4d577c9098fdef1aac46f8e85870631ee87a71739cd8ed0c6ba';
        const privateKeyBytes = Uint8Array.from(Buffer.from(privkey.slice(2), "hex"));
        const keypair = (0, sui_js_1.fromExportedKeypair)({
            schema: "ED25519",
            privateKey: (0, sui_js_1.toB64)(privateKeyBytes),
        });
        const coins = await (0, utils_1.buildInputCoinForAmount)(transactionBlock, BigInt(params.amountIn), params.a2b ? this.coinTypeA : this.coinTypeB, this.senderAddress, provider);
        if (typeof coins !== "undefined") {
            transactionBlock.moveCall({
                target: `${this.package}::${this.module}::PQD`,
                arguments: [
                    transactionBlock.object(this.uri),
                    transactionBlock.makeMoveVec({
                        objects: coins,
                    }),
                    transactionBlock.pure(params.amountIn.toFixed(0), "u64"),
                    transactionBlock.pure(0, "u64"),
                    transactionBlock.object(sui_js_1.SUI_CLOCK_OBJECT_ID),
                ],
                typeArguments: [this.coinTypeA, this.coinTypeB],
            });
            return transactionBlock;
        }
        return transactionBlock;
    }
    async estimatePriceAndFee() {
        return {
            price: 0 ** 2 / 2 ** 128,
            fee: 0,
        };
    }
}
exports.DigiTrustPool = DigiTrustPool;
