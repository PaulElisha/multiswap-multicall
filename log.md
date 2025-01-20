```
paulelisha@Macbook-M3-Pro dgswap-multicall % npx jest
  console.log
    Transaction sent. Hash: 0xMockedTxHash

      at MulticallSwap.<anonymous> (src/multicallSwap.ts:58:21)

  console.log
    Transaction confirmed. Receipt: { status: 1, transactionHash: '0xMockedTxHash' }

      at MulticallSwap.<anonymous> (src/multicallSwap.ts:61:21)

 PASS  __test__/multicallSwap.test.ts
  MulticallSwap
    ✓ should encode swap transactions and send multicall transaction (9 ms)
    ✓ should handle errors during swap execution (1 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        0.515 s, estimated 1 s
```