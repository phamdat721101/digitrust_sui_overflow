"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenAmount = void 0;
const sui_js_1 = require("@mysten/sui.js");
class TokenAmount {
    amount;
    coin;
    constructor(amount, coin) {
        this.amount = amount;
        this.coin = coin;
    }
    add(other) {
        if (this.coin != other.coin) {
            throw new Error("Trying to add different coin types");
        }
        return new TokenAmount(this.amount + other.amount, this.coin);
    }
    subtract(other) {
        if (this.coin != other.coin) {
            throw new Error("Trying to subtract different coin types");
        }
        return new TokenAmount(this.amount - other.amount, this.coin);
    }
    toString() {
        return this.amount.toString() + " " + sui_js_1.Coin.getCoinSymbol(this.coin);
    }
}
exports.TokenAmount = TokenAmount;
