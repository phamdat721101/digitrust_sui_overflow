"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fee = exports.Percentage = void 0;
const token_amount_1 = require("./token_amount");
class Percentage {
    percentage;
    constructor(percentage) {
        this.percentage = percentage;
    }
    toRatio() {
        return this.percentage * 0.01;
    }
    static fromRatio(ratio) {
        return new Percentage(ratio * 100);
    }
    ofAmount(amount) {
        return new token_amount_1.TokenAmount(this.toRatio() * amount.amount, amount.coin);
    }
    addTo(amount) {
        return amount.add(this.ofAmount(amount));
    }
    subtractFrom(amount) {
        return amount.subtract(this.ofAmount(amount));
    }
    toString() {
        return this.percentage.toString + "%";
    }
}
exports.Percentage = Percentage;
class Fee extends Percentage {
    constructor(fee_in_percent) {
        super(fee_in_percent);
    }
    deductFee(amount) {
        return super.subtractFrom(amount);
    }
}
exports.Fee = Fee;
