import { NextResponse } from "next/server";
import { getCalendarAuthUrl } from "@/lib/google/calendar";

/** Step 1: redirect user to Google OAuth consent */
export async function GET() {
  const url = getCalendarAuthUrl();
  return NextResponse.redirect(url);
}
