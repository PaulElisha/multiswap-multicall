import { MulticallSwap } from "./multicallSwap";
import { ethers } from 'ethers'

async function main() {

    const privateKey: string = "private key";
    const rpcUrl: string = "https://kaia.blockpi.network/v1/rpc/public";
    const walletAddress: string = "wallet address";

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const signer = wallet.connect(provider);

    const params = [];
    // 
    const param = {
        tokenIn: "0x02cbe46fb8a1f579254a9b485788f2d86cad51aa",  // BORA
        tokenOut: "0x19aac5f612f524b754ca7e7c41cbfa2e981a4432", // WKAIA
        recipient: walletAddress,
        fee: 0,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: BigInt(ethers.parseEther("0.0001")),  // Corrected value
        amountOutMinimum: 0,
        slippageTolerance: 0.005,
        sqrtPriceLimitX96: BigInt(0),
    };

    params.push(param);

    console.log("Initializing swap...");

    const multicallSwap = new MulticallSwap(signer);

    await multicallSwap.performSwaps(params).catch(console.error);

    console.log("Swap process completed.");
}

main().catch((error) => {
    console.error("Error executing the swap:", error);
});
