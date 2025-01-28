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
    const param1 = {
        tokenIn: "0x02cbe46fb8a1f579254a9b485788f2d86cad51aa",  // BORA
        tokenOut: "0x19aac5f612f524b754ca7e7c41cbfa2e981a4432", // WKAIA
        recipient: walletAddress,
        fee: 0,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: BigInt(ethers.parseEther("12.67127")),  // Corrected value
        amountOutMinimum: 0,
        slippageTolerance: 0.005,
        sqrtPriceLimitX96: BigInt(0),
    };

    const param2 = {
        tokenIn: "0x19aac5f612f524b754ca7e7c41cbfa2e981a4432",  // WKAIA
        tokenOut: "0x42952b873ed6f7f0a7e4992e2a9818e3a9001995", // STKAIA
        recipient: walletAddress,
        fee: 0,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: BigInt(ethers.parseEther("0.07069")),  // Corrected value
        amountOutMinimum: 0,
        slippageTolerance: 0.005,
        sqrtPriceLimitX96: BigInt(0),
    };

    params.push(param1, param2);

    console.log("Initializing swap...");

    const multicallSwap = new MulticallSwap(signer);

    await multicallSwap.performSwaps(params).catch(console.error);

    console.log("Swap process completed.");
}

main().catch((error) => {
    console.error("Error executing the swap:", error);
});
