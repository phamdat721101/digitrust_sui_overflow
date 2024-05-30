"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoinDecimals = exports.buildInputCoinForAmount = exports.getBalancesForCoinTypes = exports.getTotalBalanceByCoinType = exports.selectTradeCoins = exports.composeType = exports.extractStructTagFromType = exports.moveCallCoinZero = exports.convertTradeCoins = exports.SUI_COIN_OBJECT_ID = void 0;
const sui_js_1 = require("@mysten/sui.js");
const index_1 = require("../index");
const decimal_js_1 = __importDefault(require("decimal.js"));
exports.SUI_COIN_OBJECT_ID = "0x2::sui::SUI";
function convertTradeCoins(txb, coinIds, coinType, amount) {
    return isSuiCoin(coinType)
        ? [txb.splitCoins(txb.gas, [txb.pure(amount.toNumber())])[0]]
        : coinIds.map((id) => txb.object(id));
}
exports.convertTradeCoins = convertTradeCoins;
function moveCallCoinZero(txb, coinType) {
    return txb.moveCall({
        target: "0x2::coin::zero",
        typeArguments: [coinType],
    });
}
exports.moveCallCoinZero = moveCallCoinZero;
function isSUI(coinType) {
    return coinType.toLowerCase().indexOf("sui") > -1;
}
function isSuiCoin(coinType) {
    return extractStructTagFromType(coinType).full_address === exports.SUI_COIN_OBJECT_ID;
}
function extractStructTagFromType(type) {
    let _type = type.replace(/\s/g, "");
    const genericsString = _type.match(/(<.+>)$/);
    const generics = genericsString?.[0]?.match(/(\w+::\w+::\w+)(?:<.*?>(?!>))?/g);
    if (generics) {
        _type = _type.slice(0, _type.indexOf("<"));
        const tag = extractStructTagFromType(_type);
        const structTag = {
            ...tag,
            type_arguments: generics.map((item) => extractStructTagFromType(item).source_address),
        };
        structTag.type_arguments = structTag.type_arguments.map((item) => {
            return isSuiCoin(item)
                ? item
                : extractStructTagFromType(item).source_address;
        });
        structTag.source_address = composeType(structTag.full_address, structTag.type_arguments);
        return structTag;
    }
    const parts = _type.split("::");
    const structTag = {
        full_address: _type,
        address: parts[2] === "SUI" ? "0x2" : (0, sui_js_1.normalizeSuiObjectId)(parts[0]),
        module: parts[1],
        name: parts[2],
        type_arguments: [],
        source_address: "",
    };
    structTag.full_address = `${structTag.address}::${structTag.module}::${structTag.name}`;
    structTag.source_address = composeType(structTag.full_address, structTag.type_arguments);
    return structTag;
}
exports.extractStructTagFromType = extractStructTagFromType;
function composeType(address, ...args) {
    const generics = Array.isArray(args[args.length - 1])
        ? args.pop()
        : [];
    const chains = [address, ...args].filter(Boolean);
    let result = chains.join("::");
    if (generics && generics.length) {
        result += `<${generics.join(", ")}>`;
    }
    return result;
}
exports.composeType = composeType;
async function selectTradeCoins(provider, owner, coinType, expectedAmount) {
    console.log(`selectTradeCoins: coinType: (${coinType}), expectedAmount: (${expectedAmount})`);
    const coins = [];
    const coinIds = [];
    let totalAmount = new decimal_js_1.default(0);
    let result;
    do {
        result = await provider.getCoins({
            owner,
            coinType,
            cursor: result?.nextCursor,
        });
        coins.push(...result.data);
    } while (result.hasNextPage);
    coins.sort((a, b) => {
        return Number(b.balance) - Number(a.balance);
    });
    for (const coin of coins) {
        coinIds.push(coin.coinObjectId);
        totalAmount = totalAmount.add(coin.balance);
        if (totalAmount.gte(expectedAmount)) {
            break;
        }
    }
    return coinIds;
}
exports.selectTradeCoins = selectTradeCoins;
async function getTotalBalanceByCoinType(provider, owner, coinType) {
    const amountTotal = await provider.getBalance({
        owner,
        coinType,
    });
    console.log(`TotalBalance for CoinType (${coinType}), is: ${amountTotal.totalBalance} and the owner is: ${owner}`);
    return amountTotal.totalBalance;
}
exports.getTotalBalanceByCoinType = getTotalBalanceByCoinType;
async function getBalancesForCoinTypes(provider, owner, coinTypes) {
    let coinsBalances = new Map();
    for (let coinType of coinTypes.values()) {
        let coinBalance = await provider.getBalance({
            owner,
            coinType,
        });
        console.log(coinType, " - ", BigInt(coinBalance.totalBalance));
        coinsBalances.set(coinType, BigInt(coinBalance.totalBalance));
    }
    return coinsBalances;
}
exports.getBalancesForCoinTypes = getBalancesForCoinTypes;
async function buildInputCoinForAmount(txb, amount, coinType, owner, provider) {
    if (amount === BigInt(0)) {
        throw new Error(`The amount cannot be (${amount})`);
    }
    const totalBalance = await getTotalBalanceByCoinType(provider, owner, coinType);
    if (BigInt(totalBalance) < amount) {
        console.log(`The amount(${totalBalance}) is Insufficient balance for ${coinType} , expect ${amount}`);
        return undefined;
    }
    if (isSUI(coinType)) {
        console.log(`coinType: (${coinType}), amount: (${amount})`);
        return [txb.splitCoins(txb.gas, [txb.pure(amount)])[0]];
    }
    const coinObjectIds = await selectTradeCoins(provider, owner, coinType, new decimal_js_1.default(Number(amount)));
    console.log(`coinObjectIds: ${coinObjectIds}`);
    return coinObjectIds.map((id) => txb.object(id));
}
exports.buildInputCoinForAmount = buildInputCoinForAmount;
function selectCoinObjectIdGreaterThanOrEqual(coins, amount, exclude = []) {
    const objectArray = selectCoinAssetGreaterThanOrEqual(coins, amount, exclude).selectedCoins.map((item) => item.coinObjectId);
    const remainCoins = selectCoinAssetGreaterThanOrEqual(coins, amount, exclude).remainingCoins;
    return { objectArray, remainCoins };
}
function selectCoinAssetGreaterThanOrEqual(coins, amount, exclude = []) {
    const sortedCoins = sortByBalance(coins.filter((c) => !exclude.includes(c.coinObjectId)));
    const total = calculateTotalBalance(sortedCoins);
    if (total < amount) {
        return { selectedCoins: [], remainingCoins: sortedCoins };
    }
    if (total === amount) {
        return { selectedCoins: sortedCoins, remainingCoins: [] };
    }
    let sum = BigInt(0);
    const selectedCoins = [];
    const remainingCoins = [...sortedCoins];
    while (sum < total) {
        const target = amount - sum;
        const coinWithSmallestSufficientBalanceIndex = remainingCoins.findIndex((c) => c.balance >= target);
        if (coinWithSmallestSufficientBalanceIndex !== -1) {
            selectedCoins.push(remainingCoins[coinWithSmallestSufficientBalanceIndex]);
            remainingCoins.splice(coinWithSmallestSufficientBalanceIndex, 1);
            break;
        }
        const coinWithLargestBalance = remainingCoins.pop();
        if (coinWithLargestBalance.balance > 0) {
            selectedCoins.push(coinWithLargestBalance);
            sum += coinWithLargestBalance.balance;
        }
    }
    return {
        selectedCoins: sortByBalance(selectedCoins),
        remainingCoins: sortByBalance(remainingCoins),
    };
}
function sortByBalance(coins) {
    return coins.sort((a, b) => a.balance < b.balance ? -1 : a.balance > b.balance ? 1 : 0);
}
function sortByBalanceDes(coins) {
    return coins.sort((a, b) => a.balance > b.balance ? -1 : a.balance < b.balance ? 0 : 1);
}
function calculateTotalBalance(coins) {
    return coins.reduce((partialSum, c) => partialSum + c.balance, BigInt(0));
}
function getCoinDecimals(coinType) {
    switch (coinType) {
        case index_1.coins.SUI:
            return 9;
        case index_1.coins.USDC:
            return 6;
        case index_1.coins.CETUS:
            return 9;
        case index_1.coins.WETH:
            return 8;
        case index_1.coins.USDT:
            return 6;
        case index_1.coins.WBTC:
            return 8;
        default:
            return 0;
    }
}
exports.getCoinDecimals = getCoinDecimals;
