import CetusClmmSDK, {
	Percentage,
	adjustForSlippage,
	d,
} from "@cetusprotocol/cetus-sui-clmm-sdk";
import { testnet } from "./config";
import { create_signer } from "./create_signer";
import { BN } from "bn.js";
import * as fs from "fs";

export async function trade(
	_pool: string,
	_a2b: boolean,
	_byAmountIn: boolean,
	_amount: number,
	_slippage: number
) {
	const cetusInstance = new CetusClmmSDK(testnet);

	const signer = create_signer();

	cetusInstance.senderAddress = signer.getPublicKey().toSuiAddress();

	const pool = await cetusInstance.Pool.getPool(_pool); // 0x8581097ba4ffe7e8cfed6146bd536cde5d08d0f94021fded8b62803922c824bf

	const a2b = _a2b; // false
	const byAmountIn = _byAmountIn; // true
	const amount = new BN(_amount); // 1000000
	const slippage = Percentage.fromDecimal(d(_slippage)); // 5

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

	// console.log("Calculated Rates --------- calcResult ---------", {
	// 	estimatedAmountIn: calcResult.estimatedAmountIn.toString(),
	// 	estimatedAmountOut: calcResult.estimatedAmountOut.toString(),
	// 	estimatedEndSqrtPrice: calcResult.estimatedEndSqrtPrice.toString(),
	// 	estimatedFeeAmount: calcResult.estimatedFeeAmount.toString(),
	// 	isExceed: calcResult.isExceed,
	// 	extraComputeLimit: calcResult.extraComputeLimit,
	// 	amount: calcResult.amount.toString(),
	// 	aToB: calcResult.aToB,
	// 	byAmountIn: calcResult.byAmountIn,
	// });

	const toAmount = byAmountIn
		? calcResult.estimatedAmountOut
		: calcResult.estimatedAmountIn;
	const amountLimit = adjustForSlippage(toAmount, slippage, !byAmountIn);

	const swapPayload = await cetusInstance.Swap.createSwapTransactionPayload({
		pool_id: pool.poolAddress,
		coinTypeA: pool.coinTypeA,
		coinTypeB: pool.coinTypeB,
		a2b,
		by_amount_in: byAmountIn,
		amount: calcResult.amount.toString(),
		amount_limit: amountLimit.toString(),
	});

	const tradeTxn = await cetusInstance.fullClient.sendTransaction(
		signer,
		swapPayload
	);

	// fs.writeFile(
	// 	`trades/${tradeTxn?.digest}.json`,
	// 	JSON.stringify(tradeTxn, null, 4),
	// 	(err) => {
	// 		if (err) {
	// 			console.error("Error writing file:", err);
	// 		}
	// 	}
	// );

	console.log(
		`[${new Date().toLocaleString()}] Swap Transaction Digest: ${
			tradeTxn?.digest
		}`
	);

	return tradeTxn?.digest
}
