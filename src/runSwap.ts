import { MulticallSwap } from "./multicallSwap";
import { ethers } from 'ethers'

async function main() {


    const privateKey: string = "privateKey";
    const rpcUrl: string = "rpc-url";
    const walletAddress: string = "wallet address";


    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const signer = wallet.connect(provider);

    const params = [];

    const param = {
        tokenIn: "0x19aac5f612f524b754ca7e7c41cbfa2e981a4432",
        tokenOut: "0x42952b873ed6f7f0a7e4992e2a9818e3a9001995",
        fee: 3000,
        recipient: walletAddress,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: BigInt(ethers.parseEther("0.27704")),  // Corrected value
        amountOutMinimum: BigInt(0),
        sqrtPriceLimitX96: BigInt(0),
    };


    params.push(param);

    console.log("Initializing swap...");

    const multicallSwap = new MulticallSwap(signer);

    await multicallSwap.performSwaps(params);

    console.log("Swap process completed.");
}

main().catch((error) => {
    console.error("Error executing the swap:", error);
});
