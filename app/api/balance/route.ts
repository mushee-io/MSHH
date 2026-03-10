import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    token: "USDC",
    network: "Polygon",
    runPromptPrice: process.env.RUN_PROMPT_PRICE_USDC || "0.0001",
    minTip: process.env.MIN_TIP_USDC || "0.0001",
    treasury: process.env.TREASURY_ADDRESS || null
  });
}
