import { NextResponse } from "next/server";
import { verifyUsdcPayment } from "@/lib/usdc-verifier";

export async function POST(req: Request) {
  try {
    const { txHash, wallet, amount } = await req.json();

    if (!txHash || !wallet) {
      return NextResponse.json(
        { ok: false, error: "txHash and wallet are required" },
        { status: 400 }
      );
    }

    const result = await verifyUsdcPayment({
      txHash,
      from: wallet,
      expectedAmount: amount || process.env.RUN_PROMPT_PRICE_USDC || "0.0001"
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.reason }, { status: 400 });
    }

    return NextResponse.json({ ok: true, payment: result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Verification failed" }, { status: 500 });
  }
}
