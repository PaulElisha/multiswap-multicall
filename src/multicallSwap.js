"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MulticallSwap = void 0;
var ethers_1 = require("ethers");
var ISwapRouter_json_1 = require("../src/abi/ISwapRouter.json");
var IERC20_json_1 = require("../src/abi/IERC20.json");
var IDragonswapV2Factory_json_1 = require("../src/abi/IDragonswapV2Factory.json");
var MulticallSwap = /** @class */ (function () {
    function MulticallSwap(signer) {
        this.DRAGONSWAP_ROUTER_ADDRESS = "0xA324880f884036E3d21a09B90269E1aC57c7EC8a";
        this.UNISWAP_FACTORY_ADDRESS = "0x7431A23897ecA6913D5c81666345D39F27d946A4"; // Update to DragonSwap factory address if different
        this.signer = signer;
        this.swapRouterContract = new ethers_1.ethers.Contract(this.DRAGONSWAP_ROUTER_ADDRESS, ISwapRouter_json_1.abi, this.signer);
        this.factoryContract = new ethers_1.ethers.Contract(this.UNISWAP_FACTORY_ADDRESS, IDragonswapV2Factory_json_1.abi, this.signer);
    }
    MulticallSwap.prototype.needsApproval = function (amountIn, tokenIn) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenContract, allowance, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        tokenContract = new ethers_1.ethers.Contract(tokenIn, IERC20_json_1.abi, this.signer);
                        _b = (_a = tokenContract).allowance;
                        return [4 /*yield*/, this.signer.getAddress()];
                    case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent(), this.DRAGONSWAP_ROUTER_ADDRESS])];
                    case 2:
                        allowance = _c.sent();
                        console.log("Allowance is", allowance.toString());
                        if (!(allowance >= amountIn)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.approveToken(BigInt(0), tokenIn)];
                    case 3:
                        _c.sent();
                        throw new Error("Removed Approval for token: ".concat(tokenIn, "."));
                    case 4: return [2 /*return*/, allowance < amountIn];
                }
            });
        });
    };
    MulticallSwap.prototype.approveToken = function (amountIn, tokenIn) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenContract, approvalTx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokenContract = new ethers_1.ethers.Contract(tokenIn, IERC20_json_1.abi, this.signer);
                        return [4 /*yield*/, tokenContract.approve(this.DRAGONSWAP_ROUTER_ADDRESS, amountIn)];
                    case 1:
                        approvalTx = _a.sent();
                        console.log("Approval transaction sent: ".concat(approvalTx.hash, " for ").concat(amountIn));
                        return [4 /*yield*/, approvalTx.wait()];
                    case 2:
                        _a.sent();
                        console.log("Approval confirmed: ".concat(approvalTx.hash, " for ").concat(amountIn));
                        return [2 /*return*/];
                }
            });
        });
    };
    MulticallSwap.prototype.hasSufficientBalance = function (tokenIn, amountIn) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenContract, balance, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        tokenContract = new ethers_1.ethers.Contract(tokenIn, IERC20_json_1.abi, this.signer);
                        _b = (_a = tokenContract).balanceOf;
                        return [4 /*yield*/, this.signer.getAddress()];
                    case 1: return [4 /*yield*/, _b.apply(_a, [_c.sent()])];
                    case 2:
                        balance = _c.sent();
                        return [2 /*return*/, balance > amountIn];
                }
            });
        });
    };
    MulticallSwap.prototype.validateDeadline = function (deadline) {
        return deadline > Math.floor(Date.now() / 1000);
    };
    /**
     * Check if a liquidity pool exists and has liquidity
     * @param tokenIn - Input token address
     * @param tokenOut - Output token address
     * @param fee - Fee tier (e.g., 3000 for 0.3%)
     * @returns true if the pool exists and has liquidity, false otherwise
     */
    MulticallSwap.prototype.poolExistsWithLiquidity = function (tokenIn, tokenOut, fee) {
        return __awaiter(this, void 0, void 0, function () {
            var poolAddress, poolContract, liquidity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.factoryContract.getPool(tokenIn, tokenOut, fee)];
                    case 1:
                        poolAddress = _a.sent();
                        if (!poolAddress || poolAddress === ethers_1.ethers.ZeroAddress) {
                            console.log("Pool does not exist for ".concat(tokenIn, " and ").concat(tokenOut, " with fee ").concat(fee));
                            return [2 /*return*/, false];
                        }
                        console.log("Pool found at address: ".concat(poolAddress));
                        poolContract = new ethers_1.ethers.Contract(poolAddress, [
                            "function liquidity() view returns (uint128)"
                        ], this.signer);
                        return [4 /*yield*/, poolContract.liquidity()];
                    case 2:
                        liquidity = _a.sent();
                        console.log("Pool liquidity: ".concat(liquidity.toString()));
                        return [2 /*return*/, liquidity > 0];
                }
            });
        });
    };
    /**
     * Executes multiple swaps via a multicall transaction after verifying pool liquidity.
     * @param params - Array of swap parameters
     */
    MulticallSwap.prototype.performSwaps = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var callData, _i, params_1, param, encData, swapCalldata, txArgs, tx, receipt, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        callData = [];
                        _i = 0, params_1 = params;
                        _b.label = 1;
                    case 1:
                        if (!(_i < params_1.length)) return [3 /*break*/, 8];
                        param = params_1[_i];
                        if (!this.validateDeadline(param.deadline)) {
                            throw new Error("Deadline has expired");
                        }
                        return [4 /*yield*/, this.hasSufficientBalance(param.tokenIn, param.amountIn)];
                    case 2:
                        if (!(_b.sent())) {
                            throw new Error("Insufficient balance for token: ".concat(param.tokenIn));
                        }
                        return [4 /*yield*/, this.needsApproval(param.amountIn, param.tokenIn)];
                    case 3:
                        if (!_b.sent()) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.approveToken(param.amountIn, param.tokenIn)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [4 /*yield*/, this.poolExistsWithLiquidity(param.tokenIn, param.tokenOut, param.fee)];
                    case 6:
                        if (!(_b.sent())) {
                            throw new Error("No liquidity available in the pool for tokens ".concat(param.tokenIn, " and ").concat(param.tokenOut));
                        }
                        encData = this.swapRouterContract.interface.encodeFunctionData("exactInputSingle", [param]);
                        console.log("Encoded Data is --", encData);
                        callData.push(encData);
                        _b.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8:
                        swapCalldata = this.swapRouterContract.interface.encodeFunctionData("multicall", [callData]);
                        console.log("SwapData is --", swapCalldata);
                        _a = {
                            to: this.DRAGONSWAP_ROUTER_ADDRESS
                        };
                        return [4 /*yield*/, this.signer.getAddress()];
                    case 9:
                        txArgs = (_a.from = _b.sent(),
                            _a.data = swapCalldata,
                            _a.gasLimit = ethers_1.ethers.parseUnits("500000", "wei"),
                            _a);
                        _b.label = 10;
                    case 10:
                        _b.trys.push([10, 13, , 14]);
                        return [4 /*yield*/, this.signer.sendTransaction(txArgs)];
                    case 11:
                        tx = _b.sent();
                        console.log("Transaction sent. Hash:", tx.hash);
                        return [4 /*yield*/, tx.wait()];
                    case 12:
                        receipt = _b.sent();
                        console.log("Transaction confirmed. Receipt:", receipt);
                        return [3 /*break*/, 14];
                    case 13:
                        error_1 = _b.sent();
                        console.error("Swap failed:", error_1);
                        return [3 /*break*/, 14];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    return MulticallSwap;
}());
exports.MulticallSwap = MulticallSwap;
