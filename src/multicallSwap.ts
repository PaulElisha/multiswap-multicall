import { ethers } from "ethers";
import { abi as ISwapRouter } from "../src/abi/ISwapRouter.json";
import { abi as IERC20 } from '../src/abi/IERC20.json';
import { abi as IDragonswapV2Factory } from '../src/abi/IDragonswapV2Factory.json';
import { SwapParam } from "./interfaces/SwapParam";


export class MulticallSwap {
    private signer: ethers.Signer;
    private swapRouterContract: ethers.Contract;
    private factoryContract: ethers.Contract;
    private readonly DRAGONSWAP_ROUTER_ADDRESS: string = "0xA324880f884036E3d21a09B90269E1aC57c7EC8a";
    private readonly DRAGONSWAP_FACTORY_ADDRESS: string = "0x7431A23897ecA6913D5c81666345D39F27d946A4"; // Update to DragonSwap factory address if different

    constructor(signer: ethers.Signer) {
        this.signer = signer;
        this.swapRouterContract = new ethers.Contract(
            this.DRAGONSWAP_ROUTER_ADDRESS,
            ISwapRouter,
            this.signer
        );
        this.factoryContract = new ethers.Contract(
            this.DRAGONSWAP_FACTORY_ADDRESS,
            IDragonswapV2Factory,
            this.signer
        );
    }

    private async needsApproval(amountIn: bigint, tokenIn: string): Promise<boolean> {
        const tokenContract = new ethers.Contract(tokenIn, IERC20, this.signer);
        const allowance = await tokenContract.allowance(await this.signer.getAddress(), this.DRAGONSWAP_ROUTER_ADDRESS);
        console.log("Allowance is", allowance.toString());

        if (allowance >= amountIn) {
            await this.approveToken(BigInt(0), tokenIn);
            console.log(`Removed Approval for token: ${tokenIn}.`);
        }

        return allowance < amountIn;
    }

    private async approveToken(amountIn: bigint, tokenIn: string): Promise<void> {
        const tokenContract = new ethers.Contract(tokenIn, IERC20, this.signer);
        const approvalTx = await tokenContract.approve(this.DRAGONSWAP_ROUTER_ADDRESS, amountIn);
        console.log(`Approval transaction sent: ${approvalTx.hash} for ${amountIn}`);
        await approvalTx.wait();
        console.log(`Approval confirmed: ${approvalTx.hash} for ${amountIn}`);
    }

    private async hasSufficientBalance(tokenIn: string, amountIn: bigint): Promise<boolean> {
        const tokenContract = new ethers.Contract(tokenIn, IERC20, this.signer);
        const balance = await tokenContract.balanceOf(await this.signer.getAddress());
        return balance >= amountIn;
    }

    private validateDeadline(deadline: number): boolean {
        return deadline > Math.floor(Date.now() / 1000);
    }

    /**
 * Calculate slippage-adjusted amountOutMinimum
 * @param estimatedAmountOut - Expected amount out from the swap
 * @param slippageTolerance - User-defined slippage tolerance (e.g., 1% = 0.01)
 * @returns Amount out minimum after applying slippage tolerance
 */
    private calculateSlippage(estimatedAmountOut: number, slippageTolerance: number): bigint {
        const slippageAmount = (BigInt(estimatedAmountOut) * BigInt(Math.floor(slippageTolerance * 100))) / BigInt(10000);
        return BigInt(estimatedAmountOut) - slippageAmount; // Reduce by slippage tolerance
    }


    private async getPoolFee(tokenIn: string, tokenOut: string): Promise<number> {
        const feeTiers: number[] = [500, 2000, 10000];

        for (const fee of feeTiers) {
            const poolAddress = await this.factoryContract.getPool(tokenIn, tokenOut, fee);

            if (poolAddress !== ethers.ZeroAddress) {
                console.log(`Valid pool found for ${tokenIn} -- ${tokenOut} with fee: ${fee}`);
                return fee;
            }

        }

        throw new Error(`No valid pool found for tokens ${tokenIn} and ${tokenOut}`);
    }

    /**
     * Check if a liquidity pool exists and has liquidity
     * @param tokenIn - Input token address
     * @param tokenOut - Output token address
     * @param fee - Fee tier (e.g., 3000 for 0.3%)
     * @returns true if the pool exists and has liquidity, false otherwise
     */
    private async poolExistsWithLiquidity(tokenIn: string, tokenOut: string, fee: number): Promise<boolean> {
        const poolAddress = await this.factoryContract.getPool(tokenIn, tokenOut, fee);

        console.log(`Pool found at address: ${poolAddress}`);

        const poolContract = new ethers.Contract(poolAddress, [
            "function liquidity() view returns (uint128)"
        ], this.signer);

        const liquidity = await poolContract.liquidity();
        console.log(`Pool liquidity: ${liquidity.toString()}`);

        return liquidity > 0;
    }

    /**
     * Executes multiple swaps via a multicall transaction after verifying pool liquidity.
     * @param params - Array of swap parameters
     */
    public async performSwaps(params: SwapParam[]): Promise<void> {
        const callData: string[] = [];

        for (const param of params) {
            if (!this.validateDeadline(param.deadline)) {
                throw new Error("Deadline has expired");
                continue;
            }

            if (!(await this.hasSufficientBalance(param.tokenIn, param.amountIn))) {
                throw new Error(`Insufficient balance for token: ${param.tokenIn}`);
                continue;
            }

            if (await this.needsApproval(param.amountIn, param.tokenIn)) {
                await this.approveToken(param.amountIn, param.tokenIn);
            }

            const poolFee = await this.getPoolFee(param.tokenIn, param.tokenOut);
            param.fee = poolFee;

            if (!(await this.poolExistsWithLiquidity(param.tokenIn, param.tokenOut, param.fee))) {
                throw new Error(`No liquidity available in the pool for tokens ${param.tokenIn} and ${param.tokenOut}`);
                continue;
            }

            const slippageAdjustedAmountOutMin = this.calculateSlippage(param.amountOutMinimum, param.slippageTolerance);
            param.amountOutMinimum = Number(slippageAdjustedAmountOutMin);

            const encData = this.swapRouterContract.interface.encodeFunctionData("exactInputSingle", [param]);
            console.log("Encoded Data is --", encData);

            callData.push(encData);

        }

        if (callData.length === 0) {
            console.error("No valid swaps to execute.");
            return;
        }

        const swapCalldata = this.swapRouterContract.interface.encodeFunctionData("multicall", [callData]);
        console.log("SwapData is --", swapCalldata);

        const txArgs = {
            to: this.DRAGONSWAP_ROUTER_ADDRESS,
            from: await this.signer.getAddress(),
            data: swapCalldata,
            gasLimit: ethers.parseUnits("70000", "wei"),
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
