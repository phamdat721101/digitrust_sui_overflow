"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenPrice = void 0;
const percentage_1 = require("./percentage");
const token_amount_1 = require("./token_amount");
class TokenPrice {
    price;
    coinFrom;
    coinTo;
    constructor(price, coinFrom, coinTo) {
        this.price = price;
        this.coinFrom = coinFrom;
        this.coinTo = coinTo;
    }
    invert() {
        return new TokenPrice(1 / this.price, this.coinTo, this.coinFrom);
    }
    convert(amount) {
        if (amount.coin != this.coinFrom) {
            throw new Error("The coin types does not match");
        }
        return new token_amount_1.TokenAmount(amount.amount * this.price, this.coinFrom);
    }
    combine(other) {
        if (this.coinTo != other.coinFrom) {
            throw new Error("this.coinTo much be equal to other.coinFrom");
        }
        return new TokenPrice(this.price * other.price, this.coinFrom, other.coinTo);
    }
    includingFee(fee) {
        return new TokenPrice(this.price * (1 - fee.toRatio()), this.coinFrom, this.coinTo);
    }
    difference(other) {
        if (this.coinFrom != other.coinFrom || this.coinTo != other.coinTo) {
            throw new Error("Prices must be for the same pair.");
        }
        return percentage_1.Percentage.fromRatio(this.price / other.price);
    }
    toString() {
        let oneCoinFrom = new token_amount_1.TokenAmount(1, this.coinFrom);
        return (oneCoinFrom.toString() + " = " + this.convert(oneCoinFrom).toString());
    }
}
exports.TokenPrice = TokenPrice;
