import { ethers } from "ethers";
import * as arb from "arb-ts";
import { parseEther } from "ethers/lib/utils";
import { BigNumber } from "@ethersproject/bignumber";

const ETH_RPC_URL = "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
const ARB_RPC_URL = "https://rinkeby.arbitrum.io/rpc";
const MNEMONIC = "YOUR MNEMONIC";

// https://github.com/OffchainLabs/arbitrum/blob/master/packages/arb-ts/integration_test/config.ts
const l1GatewayRouter = "0x70C143928eCfFaf9F5b406f7f4fC28Dc43d68380";
const l2GatewayRouter = "0x9413AD42910c1eA60c737dB5f58d1C504498a3cD";

// deposoit eth to Arbitrum ethereum contract
async function l1tol2DepositETH(ethWallet: ethers.Signer, arbWallet: ethers.Signer) {
    const bridge = await arb.Bridge.init(
        ethWallet,
        arbWallet,
        l1GatewayRouter,
        l2GatewayRouter
    )

    const deposit_tx = await bridge.depositETH(parseEther('0.15'));
    console.log("l1tol2DepositETH: \n", deposit_tx);
}

// withdraw eth from Arbitrum
async function l2tol1WithdrawETH(ethWallet: ethers.Signer, arbWallet: ethers.Signer) {
    const bridge = await arb.Bridge.init(
        ethWallet,
        arbWallet,
        l1GatewayRouter,
        l2GatewayRouter
    )

    const deposit_tx = await bridge.withdrawETH(parseEther('0.15'));
    console.log("l2tol1WithdrawETH: \n", deposit_tx);
}

// transfer eth between L2
async function transferETHL2(fromWallet: ethers.Wallet, toWallet: ethers.Wallet) {
    const tx = await fromWallet.sendTransaction({
        to: toWallet.address,
        value: parseEther("0.11"),
        gasLimit: 800000,
        gasPrice: ethers.utils.parseUnits("10", "gwei")
    });
    console.log("layer2 eth transfer:\n", tx);
}

// deposit erc20 to layer2
async function l1tol2DepositERC20(ethWallet: ethers.Signer, arbWallet: ethers.Signer) {
    const USDT = "0xD92E713d051C37EbB2561803a3b5FBAbc4962431";

    const bridge = await arb.Bridge.init(
        ethWallet,
        arbWallet,
        l1GatewayRouter,
        l2GatewayRouter
    )

    const deposit_usdt = await bridge.deposit(USDT, BigNumber.from(10000000));
    console.log("deposit usdt: \n", deposit_usdt);
}

// layer2 erc20 token transfer
async function transferERC20L2(fromWallet: ethers.Wallet, toWallet: ethers.Wallet) {
    const USDC_L2 = "0x09b98f8b2395d076514037ff7d39a091a536206c";

    const abi = [
        // Read-Only Functions
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
    
        // Authenticated Functions
        "function transfer(address to, uint amount) returns (boolean)",
    
        // Events
        "event Transfer(address indexed from, address indexed to, uint amount)"
    ];
    const erc20 = new ethers.Contract(USDC_L2, abi, fromWallet);
    const decimal = await erc20.decimals();
    let tx = await erc20.transfer(toWallet.address, 100 * Math.pow(10, decimal));
    console.log("txxx " ,tx);
}

async function main() {
    const ethProvider = new ethers.providers.JsonRpcProvider(ETH_RPC_URL);
    const arbProvider = new ethers.providers.JsonRpcProvider(ARB_RPC_URL);
    const bip44Path = "m/44'/60'/0'/0/0";
    const bip44Path2 = "m/44'/60'/0'/0/1";
    const hd = ethers.utils.HDNode.fromMnemonic(MNEMONIC);
    const hdwlt1 = hd.derivePath(bip44Path);
    const hdwlt2 = hd.derivePath(bip44Path2);
    const ethWlt1 = new ethers.Wallet(hdwlt1.privateKey, ethProvider);
    const ethWlt2 = new ethers.Wallet(hdwlt2.privateKey, ethProvider);
    const arbWlt1 = new ethers.Wallet(hdwlt1.privateKey, arbProvider);
    const arbWlt2 = new ethers.Wallet(hdwlt2.privateKey, arbProvider);

    // await l1tol2DepositETH(ethWlt1, arbWlt1);
    // await l2tol1WithdrawETH(ethWlt1, arbWlt1);
    // await transferETHL2(arbWlt1, arbWlt2);
    // await transferERC20L2(arbWlt1, arbWlt2);
    await l1tol2DepositERC20(ethWlt1, arbWlt1);
}


main().then( () =>{
    console.log("success");
}).catch(e =>{
    console.log('error: ', e);
})
