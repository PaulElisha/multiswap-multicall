import { ethers } from "ethers";
import { MulticallSwap } from "../src/multicallSwap"; // Adjust path accordingly

jest.mock("ethers");

describe("MulticallSwap", () => {
    let mockSigner: jest.Mocked<ethers.Signer>;
    let mockContract: jest.Mocked<ethers.Contract>;
    let multicallSwap: MulticallSwap;

    const DRAGONSWAP_ROUTER_ADDRESS = "0xA324880f884036E3d21a09B90269E1aC57c7EC8a";

    beforeEach(() => {
        // Mock signer
        mockSigner = {
            getAddress: jest.fn().mockResolvedValue("0xMockedUserAddress"),
            sendTransaction: jest.fn().mockResolvedValue({
                hash: "0xMockedTxHash",
                wait: jest.fn().mockResolvedValue({ status: 1, transactionHash: "0xMockedTxHash" }),
            }),
        } as unknown as jest.Mocked<ethers.Signer>;

        // Mock ERC20 contract
        mockContract = {
            allowance: jest.fn().mockResolvedValue(BigInt(0)), // Mock allowance
            balanceOf: jest.fn().mockResolvedValue(BigInt(1000000000)), // Mock balance check
            approve: jest.fn().mockResolvedValue({
                hash: "0xMockedApprovalTxHash",
                wait: jest.fn().mockResolvedValue({ status: 1 }),
            }),
            interface: {
                encodeFunctionData: jest.fn()
                    .mockReturnValueOnce("0xMockedCallData1")
                    .mockReturnValueOnce("0xMockedCallData2")
                    .mockReturnValue("0xMockedMulticallData"),
            },
        } as unknown as jest.Mocked<ethers.Contract>;

        // Mock ethers.Contract constructor to return the mocked contract
        (ethers.Contract as jest.Mock).mockImplementation(() => mockContract);

        // Instantiate MulticallSwap with the mocked signer
        multicallSwap = new MulticallSwap(mockSigner);
    });

    test("should encode swap transactions and send multicall transaction", async () => {
        const swapParams = [
            {
                tokenIn: "0xTokenInAddress",
                tokenOut: "0xTokenOutAddress",
                fee: 3000,
                recipient: "0xRecipientAddress",
                deadline: Math.floor(Date.now() / 1000) + 60 * 20,
                amountIn: BigInt(1000000),
                amountOutMinimum: BigInt(900000),
                sqrtPriceLimitX96: BigInt(0),
            }
        ];

        await multicallSwap.performSwaps(swapParams);

        // Check if balanceOf was called
        expect(mockContract.balanceOf).toHaveBeenCalledWith("0xMockedUserAddress");

        // Check if allowance was checked and approve was called
        expect(mockContract.allowance).toHaveBeenCalled();
        expect(mockContract.approve).toHaveBeenCalledWith(DRAGONSWAP_ROUTER_ADDRESS, BigInt(1000000));

        // Check if encoded function data was created
        expect(mockContract.interface.encodeFunctionData).toHaveBeenCalledWith("exactInputSingle", [swapParams[0]]);

        // Check if sendTransaction was called
        expect(mockSigner.sendTransaction).toHaveBeenCalledWith({
            to: DRAGONSWAP_ROUTER_ADDRESS,
            from: "0xMockedUserAddress",
            data: "0xMockedCallData2",
        });
    });

    test("should handle errors during swap execution", async () => {
        const swapParams = [
            {
                tokenIn: "0xTokenInAddress",
                tokenOut: "0xTokenOutAddress",
                fee: 3000,
                recipient: "0xRecipientAddress",
                deadline: Math.floor(Date.now() / 1000) + 60 * 20,
                amountIn: BigInt(1000000),
                amountOutMinimum: BigInt(900000),
                sqrtPriceLimitX96: BigInt(0),
            }
        ];

        // Simulate transaction failure
        mockSigner.sendTransaction.mockRejectedValue(new Error("Transaction failed"));

        console.error = jest.fn(); // Suppress console.error output in test logs

        await multicallSwap.performSwaps(swapParams);

        expect(console.error).toHaveBeenCalledWith("Swap failed:", expect.any(Error));
    });

    test("should validate swap deadline", () => {
        const validDeadline = Math.floor(Date.now() / 1000) + 60 * 10;
        const expiredDeadline = Math.floor(Date.now() / 1000) - 60;

        expect(multicallSwap["validateDeadline"](validDeadline)).toBe(true);
        expect(multicallSwap["validateDeadline"](expiredDeadline)).toBe(false);
    });
});
