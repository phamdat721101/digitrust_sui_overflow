"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create_signer = void 0;
const ed25519_1 = require("@mysten/sui.js/keypairs/ed25519");
function create_signer() {
    const secretKey = '0xbc59c0992aa183ca50134fb7734844f473f43428bddf6cc55c95bd87ede72ad2';
    const privateKeyBytes = Uint8Array.from(Buffer.from(secretKey.slice(2), "hex"));
    const keypair = ed25519_1.Ed25519Keypair.fromSecretKey(privateKeyBytes);
    return keypair;
}
exports.create_signer = create_signer;
