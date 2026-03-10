import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json({ ok: true, activity: [] });
    }

    const { data, error } = await supabase
      .from("prompt_runs")
      .select("id,wallet,prompt,cost,tx_hash,status,created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, activity: data || [] });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to load activity" }, { status: 500 });
  }
}
