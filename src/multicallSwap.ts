import { ethers } from "ethers";
import { abi as ISwapRouter } from "../src/abi/ISwapRouter.json";

interface SwapParam {
    tokenIn: string;
    tokenOut: string;
    fee: number;
    recipient: string;
    deadline: number;
    amountIn: bigint;
    amountOutMinimum: bigint;
    sqrtPriceLimitX96: bigint;
}


export class MulticallSwap {
    private signer: ethers.Signer;
    private swapRouterContract: ethers.Contract;
    private readonly DRAGONSWAP_ROUTER_ADDRESS: string = "0x11DA6463D6Cb5a03411Dbf5ab6f6bc3997Ac7428";

    constructor(signer: ethers.Signer) {
        this.signer = signer;
        this.swapRouterContract = new ethers.Contract(
            this.DRAGONSWAP_ROUTER_ADDRESS,
            ISwapRouter,
            this.signer
        );
    }

    /**
     * Executes multiple swaps via a multicall transaction.
     * @param params - Array of swap parameters
     */
    public async performSwaps(params: SwapParam[]): Promise<void> {
        const callData: string[] = [];

        for (const param of params) {
            const encData = this.swapRouterContract.interface.encodeFunctionData("exactInputSingle", [
                param
            ]);

            callData.push(encData);
        }

        const swapCalldata = this.swapRouterContract.interface.encodeFunctionData("multicall", [callData]);

        const txArgs = {
            to: this.DRAGONSWAP_ROUTER_ADDRESS,
            from: await this.signer.getAddress(),
            data: swapCalldata,
        };

        try {
            const tx = await this.signer.sendTransaction(txArgs);
            console.log("Transaction sent. Hash:", tx.hash);

            const receipt = await tx.wait();
            console.log("Transaction confirmed. Receipt:", receipt);
        } catch (error) {
            console.error("Swap failed:", error);
        }
    }
}

