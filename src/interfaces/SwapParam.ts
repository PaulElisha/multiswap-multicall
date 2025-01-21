export interface SwapParam {
    tokenIn: string;
    tokenOut: string;
    recipient: string;
    fee: number;
    deadline: number;
    amountIn: bigint;
    amountOutMinimum: number;
    slippageTolerance: number;
    sqrtPriceLimitX96: bigint;
}