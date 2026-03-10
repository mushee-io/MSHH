import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const { sender, receiver, amount, txHash } = await req.json();

    if (!sender || !receiver || !amount) {
      return NextResponse.json(
        { ok: false, error: "sender, receiver, and amount are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from("tips").insert({
        sender,
        receiver,
        amount,
        tx_hash: txHash || null,
        status: "recorded"
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Tip recorded successfully",
      tip: { sender, receiver, amount, txHash: txHash || null }
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Tip failed" }, { status: 500 });
  }
}
