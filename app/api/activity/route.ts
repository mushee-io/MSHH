import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json({
        ok: true,
        activity: [],
        note: "Supabase keys missing. Add them in Vercel to enable activity logging."
      });
    }

    const [payments, promptRuns, tips] = await Promise.all([
      supabase.from("payments").select("*").order("created_at", { ascending: false }).limit(8),
      supabase.from("prompt_runs").select("*").order("created_at", { ascending: false }).limit(8),
      supabase.from("tips").select("*").order("created_at", { ascending: false }).limit(8)
    ]);

    return NextResponse.json({
      ok: true,
      payments: payments.data || [],
      promptRuns: promptRuns.data || [],
      tips: tips.data || []
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to load activity" }, { status: 500 });
  }
}
