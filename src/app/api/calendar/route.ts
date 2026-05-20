import { NextResponse } from "next/server";
import { fetchUpcomingEvents } from "@/lib/google/calendar";

export async function GET() {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!refreshToken) {
    return NextResponse.json({ events: [], configured: false });
  }

  try {
    const events = await fetchUpcomingEvents(refreshToken);
    return NextResponse.json({ events, configured: true });
  } catch (e) {
    console.error("Calendar sync error:", e);
    return NextResponse.json({ events: [], error: "sync_failed" }, { status: 500 });
  }
}
