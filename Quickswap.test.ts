import "dotenv/config";
import { expect } from "chai";
import { ethers, waffle, deployments } from "hardhat";

import { getUniswapV2Router02 } from "./utils/contracts/periphery";
import IERC20MetadataArtifact from "@openzeppelin/contracts/build/contracts/IERC20Metadata.json";

import { getTwentyMinuteDeadline } from "./utils/deadline";

import {
  ChainId,
  JSBI,
  Fetcher,
  Token,
  TokenAmount,
  Pair,
  Trade,
} from "quickswap-sdk";

describe("UniswapSlidingWindowOracle", () => {
  let uniswapV2Router02: any;

  let provider: any;

  before(async () => {
    provider = waffle.provider;
  });

  beforeEach(async () => {
    uniswapV2Router02 = await getUniswapV2Router02(provider);
  });

  it.skip("should swap myst for fid", async () => {
    const amounts = await uniswapV2Router02.getAmountsOut(
      ethers.utils.parseEther("1"),
      [
        "0x1379E8886A944d2D9d440b3d88DF536Aea08d9F3",
        "0x9A4Eb698e5DE3D3Df0a68F681789072DE1E50222",
      ]
    );

    console.log("amounts", amounts);
  });

  it.skip("should swap usdc to fidira", async () => {
    // const deadline = await getTwentyMinuteDeadline();

    /*
    const amounts = await uniswapV2Router02.getAmountsIn("100000000", [ uniswapV2Router02.WETH(), "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"]);

    await uniswapV2Router02.swapETHForExactTokens("100000000", [ await uniswapV2Router02.WETH(), "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"], await provider.getSigner().getAddress(), deadline, { value: amounts[0] });
    */

    const wmatic = new ethers.Contract(
      await uniswapV2Router02.WETH(),
      IERC20MetadataArtifact.abi,
      provider
    );

    const weth = new ethers.Contract(
      "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      IERC20MetadataArtifact.abi,
      provider
    );

    const usdc = new ethers.Contract(
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      IERC20MetadataArtifact.abi,
      provider
    );

    const fid = new ethers.Contract(
      "0x9A4Eb698e5DE3D3Df0a68F681789072DE1E50222",
      IERC20MetadataArtifact.abi,
      provider
    );

    const signedUsdc = usdc.connect(provider.getSigner());
    await signedUsdc.approve(uniswapV2Router02.address, "100000000");

    const token0 = new Token(
      ChainId.MATIC,
      wmatic.address,
      await wmatic.decimals(),
      await wmatic.symbol(),
      await wmatic.name()
    );
    const token1 = new Token(
      ChainId.MATIC,
      weth.address,
      await weth.decimals(),
      await weth.symbol(),
      await weth.name()
    );
    const token2 = new Token(
      ChainId.MATIC,
      usdc.address,
      await usdc.decimals(),
      await usdc.symbol(),
      await usdc.name()
    );
    const token3 = new Token(
      ChainId.MATIC,
      fid.address,
      await fid.decimals(),
      await fid.symbol(),
      await fid.name()
    );

    console.log(Pair.getAddress(token0, token1));

    // const pair = new Pair(new TokenAmount(token0, JSBI.BigInt(amounts[0])), new TokenAmount(token1,  JSBI.BigInt(amounts[1])))

    const provider2: any = new ethers.providers.JsonRpcProvider(
      "https://polygon-mainnet.g.alchemy.com/v2/EJxLOv_k16MhE4_0Qw1QHf7RQtQHcvP2"
    );

    const pairs = [];

    pairs.push(await Fetcher.fetchPairData(token0, token1, provider2));
    pairs.push(await Fetcher.fetchPairData(token2, token0, provider2));
    pairs.push(await Fetcher.fetchPairData(token2, token1, provider2));
    pairs.push(await Fetcher.fetchPairData(token0, token3, provider2));
    pairs.push(await Fetcher.fetchPairData(token1, token3, provider2));
    pairs.push(await Fetcher.fetchPairData(token2, token3, provider2));

    console.log(await Fetcher.fetchPairData(token2, token3, provider2));

    const bestTrades = Trade.bestTradeExactIn(
      pairs,
      new TokenAmount(token2, JSBI.BigInt("1000000")),
      token3
    );

    for (var i = 0; i < bestTrades.length; i++) {
      console.log(bestTrades[i].route);
    }

    const amounts2 = await uniswapV2Router02.getAmountsOut("100000000", [
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      "0x9A4Eb698e5DE3D3Df0a68F681789072DE1E50222",
    ]);

    console.log("direct", amounts2);

    const amounts3 = await uniswapV2Router02.getAmountsOut("100000000", [
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      "0x9A4Eb698e5DE3D3Df0a68F681789072DE1E50222",
    ]);

    console.log(
      "indirect",
      amounts3[0].toString(),
      amounts3[1].toString(),
      amounts3[2].toString()
    );

    /*
    await uniswapV2Router02.swapExactTokensForTokens("100000000", amounts3[2], [	"0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
"0x9A4Eb698e5DE3D3Df0a68F681789072DE1E50222" ], await provider.getSigner().getAddress(), deadline);

    const balance = await fid.balanceOf(await provider.getSigner().getAddress());

    console.log("balance", balance.toString());
    */
  });
});
