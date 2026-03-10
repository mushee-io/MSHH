import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";
import { verifyUsdcPayment } from "../../../lib/usdc-verifier";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const PRICE = process.env.RUN_PROMPT_PRICE_USDC || "0.0001";

export async function POST(req: Request) {
  try {
    const { prompt, wallet, txHash } = await req.json();

    if (!prompt || !wallet || !txHash) {
      return NextResponse.json(
        { ok: false, error: "prompt, wallet and txHash are required" },
        { status: 400 }
      );
    }

    const payment = await verifyUsdcPayment({
      txHash,
      from: wallet,
      expectedAmount: PRICE,
    });

    if (!payment.ok) {
      return NextResponse.json(
        { ok: false, error: payment.reason || "Payment verification failed" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("\n") ||
      "";

    const supabase = getSupabaseAdmin();

    if (supabase) {
      await supabase.from("payments").insert({
        wallet,
        amount: PRICE,
        token: "USDC",
        tx_hash: txHash,
        status: "verified",
      });

      await supabase.from("prompt_runs").insert({
        wallet,
        prompt,
        cost: PRICE,
        tx_hash: txHash,
        status: "success",
      });
    }

    return NextResponse.json({
      ok: true,
      wallet,
      price: PRICE,
      txHash,
      result: {
        text,
        raw: data,
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "AI request failed" },
      { status: 500 }
    );
  }
}
