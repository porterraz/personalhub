import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchFinanceFromSheet } from "@/lib/google/sheets";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const spreadsheetId = process.env.GOOGLE_SHEETS_FINANCE_ID;

  if (!refreshToken || !spreadsheetId) {
    return NextResponse.json({ error: "Google Sheets not configured" }, { status: 400 });
  }

  try {
    const rows = await fetchFinanceFromSheet(refreshToken, spreadsheetId);
    const payload = rows.map((r) => ({ ...r, user_id: user.id, raw_payload: r }));

    const { error } = await supabase.from("finance_snapshots").upsert(payload, {
      onConflict: "user_id,snapshot_date",
    });

    if (error) throw error;
    return NextResponse.json({ synced: rows.length });
  } catch (e) {
    console.error("Finance sync error:", e);
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
}
