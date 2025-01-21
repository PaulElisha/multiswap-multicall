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
var multicallSwap_1 = require("./multicallSwap");
var ethers_1 = require("ethers");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var privateKey, rpcUrl, walletAddress, provider, wallet, signer, params, param, multicallSwap;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    privateKey = "3a5a4358e80d31101bb7705c84a9f0f85ced7aed9dd9b5c3f5eff6afad87b385";
                    rpcUrl = "https://kaia.blockpi.network/v1/rpc/public";
                    walletAddress = "0x1bab6c36d216f27730519dfa284a4587b26182cb";
                    provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
                    wallet = new ethers_1.ethers.Wallet(privateKey, provider);
                    signer = wallet.connect(provider);
                    params = [];
                    param = {
                        tokenIn: "0x02cbe46fb8a1f579254a9b485788f2d86cad51aa",
                        tokenOut: "0x19aac5f612f524b754ca7e7c41cbfa2e981a4432",
                        fee: 2000,
                        recipient: walletAddress,
                        deadline: Math.floor(Date.now() / 1000) + (60 * 10),
                        amountIn: BigInt(ethers_1.ethers.parseEther("5")), // Corrected value
                        amountOutMinimum: BigInt(0),
                        sqrtPriceLimitX96: BigInt(0),
                    };
                    params.push(param);
                    console.log("Initializing swap...");
                    multicallSwap = new multicallSwap_1.MulticallSwap(signer);
                    return [4 /*yield*/, multicallSwap.performSwaps(params).catch(console.error)];
                case 1:
                    _a.sent();
                    console.log("Swap process completed.");
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error("Error executing the swap:", error);
});
