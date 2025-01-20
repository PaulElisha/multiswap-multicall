import { ethers } from "ethers";
import { MulticallSwap } from "../src/multicallSwap"; // Adjust according to your file structure

jest.mock("ethers");

describe("MulticallSwap", () => {
    let mockSigner: jest.Mocked<ethers.Signer>;
    let mockContract: jest.Mocked<ethers.Contract>;
    let multicallSwap: MulticallSwap;

    const DRAGONSWAP_ROUTER_ADDRESS = "0x11DA6463D6Cb5a03411Dbf5ab6f6bc3997Ac7428";

    beforeEach(() => {
        // Mock signer
        mockSigner = {
            getAddress: jest.fn().mockResolvedValue("0xMockedUserAddress"),
            sendTransaction: jest.fn().mockResolvedValue({
                hash: "0xMockedTxHash",
                wait: jest.fn().mockResolvedValue({ status: 1, transactionHash: "0xMockedTxHash" }),
            }),
        } as unknown as jest.Mocked<ethers.Signer>;

        // Mock contract
        mockContract = {
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
            },
            {
                tokenIn: "0xTokenInAddress2",
                tokenOut: "0xTokenOutAddress2",
                fee: 3000,
                recipient: "0xRecipientAddress",
                deadline: Math.floor(Date.now() / 1000) + 60 * 20,
                amountIn: BigInt(2000000),
                amountOutMinimum: BigInt(1800000),
                sqrtPriceLimitX96: BigInt(0),
            }
        ];

        await multicallSwap.performSwaps(swapParams);

        // Check if function data was encoded correctly
        expect(mockContract.interface.encodeFunctionData).toHaveBeenCalledWith("exactInputSingle", [swapParams[0]]);
        expect(mockContract.interface.encodeFunctionData).toHaveBeenCalledWith("exactInputSingle", [swapParams[1]]);
        expect(mockContract.interface.encodeFunctionData).toHaveBeenCalledWith("multicall", [["0xMockedCallData1", "0xMockedCallData2"]]);

        // Check if sendTransaction was called with correct arguments
        expect(mockSigner.sendTransaction).toHaveBeenCalledWith({
            to: DRAGONSWAP_ROUTER_ADDRESS,
            from: "0xMockedUserAddress",
            data: "0xMockedMulticallData",
        });

        // Verify that transaction was sent and waited for
        const txResponse = await mockSigner.sendTransaction.mock.results[0].value;
        expect(txResponse.wait).toHaveBeenCalled();
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
});
