import {
  createPublicClient,
  getAddress,
  http,
  parseAbiItem,
  parseUnits,
  type Hash,
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
  transport: http(rpcUrl),
});

export async function verifyUsdcPayment({
  txHash,
  from,
  expectedAmount,
}: {
  txHash: `0x${string}`;
  from: string;
  expectedAmount: string;
}) {
  if (!usdcContract || !treasuryAddress) {
    return { ok: false, reason: "Missing USDC_CONTRACT or TREASURY_ADDRESS" };
  }

  const normalizedFrom = getAddress(from);
  const normalizedTreasury = getAddress(treasuryAddress);
  const normalizedUsdc = getAddress(usdcContract);
  const expected = parseUnits(expectedAmount, 6);

  const receipt = await client.getTransactionReceipt({
    hash: txHash as Hash,
  });

  if (receipt.status !== "success") {
    return { ok: false, reason: "Transaction failed" };
  }

  const logs = await client.getLogs({
    address: normalizedUsdc,
    event: transferEvent,
    fromBlock: receipt.blockNumber,
    toBlock: receipt.blockNumber,
  });

  const matched = logs.find((log) => {
    const args = log.args as {
      from?: string;
      to?: string;
      value?: bigint;
    };

    if (!args.from || !args.to || args.value == null) return false;

    return (
      getAddress(args.from) === normalizedFrom &&
      getAddress(args.to) === normalizedTreasury &&
      args.value >= expected &&
      (log.transactionHash || "").toLowerCase() === txHash.toLowerCase()
    );
  });

  if (!matched) {
    return { ok: false, reason: "No valid USDC transfer to treasury found" };
  }

  return {
    ok: true,
    amount: matched.args.value?.toString() || expected.toString(),
    txHash,
    blockNumber: receipt.blockNumber.toString(),
  };
}
