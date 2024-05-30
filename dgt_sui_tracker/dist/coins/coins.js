"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoinInfo = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function getCoinInfo(coin_type) {
    const jsonData = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve("src/coins/coins.json"), "utf-8"));
    for (const coin of jsonData) {
        if (coin.coin_type === coin_type) {
            return coin;
        }
    }
    return {
        name: coin_type,
        symbol: "N/A",
        coin_type: coin_type,
        coingecko_id: "N/A",
        decimals: 0,
        icon_url: "N/A",
        project_url: "N/A",
        source: "N/A",
    };
}
exports.getCoinInfo = getCoinInfo;
