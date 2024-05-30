import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

export function create_signer() {
	const secretKey = '0xbc59c0992aa183ca50134fb7734844f473f43428bddf6cc55c95bd87ede72ad2'
	const privateKeyBytes = Uint8Array.from(Buffer.from(secretKey.slice(2), "hex")); 
	const keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);

	return keypair
}
