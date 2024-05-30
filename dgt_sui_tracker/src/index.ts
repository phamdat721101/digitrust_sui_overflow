import { trade } from "./dexs/cetus/trade";
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client'
import {TransactionBlock} from '@mysten/sui.js/transactions'
import {Ed25519Keypair} from '@mysten/sui.js/keypairs/ed25519'
import cron from 'node-cron'; 

const client = new SuiClient({
	url: getFullnodeUrl('testnet'),
});

async function main() {
	console.log(`[${new Date().toLocaleString()}] App Started`);

	const events = await client.queryEvents({
		query: { Sender: '0xa4c033f96e0997bd61ae2141012837c0f51c7b9b635e35879511bdf3b6cd4a33'},
		limit: 9,
	})

	for(let i = 0; i < events.data.length; i++){
		if(events.data[i].transactionModule == 'vault' && events.data[i].type.includes('Deposit')){
		  	console.log(events.data[i])

			const tx_resp = await trade(
				"0x8581097ba4ffe7e8cfed6146bd536cde5d08d0f94021fded8b62803922c824bf",
				false,
				true,
				1000000,
				5
			);

			console.log("Transaction resp: ", tx_resp)
		}
	  }
}

cron.schedule('*/10 * * * * *', async function() {
    console.log("DigiTrust monitor is running");
	main().catch(console.error);
});