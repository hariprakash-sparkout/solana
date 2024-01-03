import * as web3 from '@solana/web3.js';
import bs58 from 'bs58';
import { createMint, getAccount, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import { Keypair, PublicKey } from '@solana/web3.js';

const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');

// const _pubKey = new Uint8Array([
//     145, 95, 255, 94, 138, 107, 116, 8,
//     137, 106, 94, 171, 179, 255, 45, 62,
//     172, 40, 247, 147, 33, 54, 157, 13,
//     108, 157, 33, 151, 194, 25, 35, 158
// ]);

const _privateKey = new Uint8Array([208, 237, 5, 56, 251, 59, 212, 223, 115, 121, 62, 59, 17, 245, 124, 134, 128, 247, 15, 251, 126, 114, 192, 115, 195, 127, 209, 208, 231, 219, 249, 94, 111, 64, 215, 211, 60, 200, 141, 205, 85, 159, 186, 197, 177, 117, 57, 140, 222, 13, 209, 20, 17, 39, 241, 92, 30, 96, 90, 208, 140, 166, 180, 235]);
const _wallet = web3.Keypair.generate();

// const pubKey = _wallet.publicKey.toBase58();
// const privateKey = bs58.encode(Buffer.from(_wallet.secretKey));
const privateKey = bs58.encode(Buffer.from(_privateKey));

const wallet: { secretKey: Uint8Array; publicKey: PublicKey } = {
    secretKey: _privateKey,
    // publicKey: new PublicKey(_pubKey)
    publicKey: new PublicKey(bs58.decode('8VHbv6D865bxXFdDBnZnXxF9XMq3ZJDXBo6SdieEikdY'))

};

// Invoke the asynchronous functions
(async () => {
    // Airdrop example
    await airdropSolIfNeeded(wallet, connection); // Call the function with the wallet and connection
    await createMintAndTokenAccount();
})();


async function airdropSolIfNeeded(signer: { publicKey: PublicKey }, connection: web3.Connection): Promise<void> {
    const balance = await connection.getBalance(signer.publicKey);
    console.log("Current balance is", balance / web3.LAMPORTS_PER_SOL);

    if (balance < web3.LAMPORTS_PER_SOL) {
        console.log("Airdropping 1 SOL...");
        const airdropSignature = await connection.requestAirdrop(signer.publicKey, web3.LAMPORTS_PER_SOL);

        const latestBlockHash = await connection.getLatestBlockhash();

        await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: airdropSignature,
        });

        const newBalance = await connection.getBalance(signer.publicKey);
        console.log("New balance is", newBalance / web3.LAMPORTS_PER_SOL);
    }
}

async function createMintAndTokenAccount(): Promise<void> {
    const token = await createMint(
        connection,
        wallet, // the fee payer
        wallet.publicKey, // the mint authority
        wallet.publicKey, // the freeze authority
        9 // the decimals used, we use 9 because it's the default and recommended value
    );

    console.log('New Token ========== :', token.toBase58());
    const balance = await connection.getBalance(wallet.publicKey);
    // console.log("Current balance is", balance / web3.LAMPORTS_PER_SOL);

    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet, // the wallet where you create the account
        token, // the token to create an account for
        wallet.publicKey // the wallet that pays the gas fees
    );

    // console.log(tokenAccount.address.toBase58());

    const tokenAccountInfo = await getAccount(
        connection,
        tokenAccount.address
    )

    // console.log(tokenAccountInfo); // outputs the balance


    await mintTo(
        connection,
        wallet,
        token,
        tokenAccount.address,
        wallet.publicKey,
        100 * web3.LAMPORTS_PER_SOL // because decimals are set to 9
    )
}

