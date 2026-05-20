import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

/** OAuth callback — copy refresh_token from logs into GOOGLE_REFRESH_TOKEN */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { tokens } = await oauth2.getToken(code);
  console.log("Google tokens received. Store refresh_token in env:", tokens.refresh_token);

  return NextResponse.redirect(
    new URL("/?google=connected", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
  );
}
