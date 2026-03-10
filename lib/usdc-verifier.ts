import {
  createPublicClient,
  getAddress,
  http,
  parseAbiItem,
  parseUnits,
  type Hash
} from "viem";
import { polygon } from "viem/chains";

const rpcUrl = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
const usdcContract = process.env.USDC_CONTRACT;
const treasuryAddress = process.env.TREASURY_ADDRESS;

const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)"
);

const client = createPublicClient({
  chain: polygon,
  transport: http(rpcUrl)
});

export async function verifyUsdcPayment(input: {
  txHash: `0x${string}`;
  from: string;
  expectedAmount: string;
}) {
  try {
    if (!usdcContract || !treasuryAddress) {
      return { ok: false, reason: "USDC contract or treasury address missing" };
    }

    const normalizedFrom = getAddress(input.from);
    const normalizedContract = getAddress(usdcContract);
    const normalizedTreasury = getAddress(treasuryAddress);
    const expected = parseUnits(input.expectedAmount, 6);

    const receipt = await client.getTransactionReceipt({
      hash: input.txHash as Hash
    });

    if (receipt.status !== "success") {
      return { ok: false, reason: "Transaction failed" };
    }

    const logs = await client.getLogs({
      address: normalizedContract,
      event: transferEvent,
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber
    });

    const match = logs.find((log) => {
      const args = log.args as { from?: string; to?: string; value?: bigint };
      if (!args.from || !args.to || typeof args.value === "undefined") return false;

      return (
        log.transactionHash?.toLowerCase() === input.txHash.toLowerCase() &&
        getAddress(args.from) === normalizedFrom &&
        getAddress(args.to) === normalizedTreasury &&
        args.value >= expected
      );
    });

    if (!match) {
      return { ok: false, reason: "No valid USDC transfer to treasury found" };
    }

    const amount = (match.args as { value?: bigint }).value?.toString() || expected.toString();

    return {
      ok: true,
      txHash: input.txHash,
      blockNumber: receipt.blockNumber.toString(),
      amount
    };
  } catch (error) {
    return { ok: false, reason: "Verification failed" };
  }
}
