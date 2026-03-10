import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const { sender, receiver, amount, txHash, message } = await req.json();

    if (!sender || !receiver || !amount || !txHash) {
      return NextResponse.json(
        { ok: false, error: "sender, receiver, amount and txHash are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    if (supabase) {
      await supabase.from("tips").insert({
        sender,
        receiver,
        amount,
        tx_hash: txHash,
        message: message || null,
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Tip recorded successfully",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to record tip" },
      { status: 500 }
    );
  }
}
